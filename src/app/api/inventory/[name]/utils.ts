import prisma from "../../../../libs/prisma";
import { respond, respondWithInit } from "../../../../utils/api/ApiUtils";
import { Inventory, InventorySnapshot, Prisma, Stock, StockSnapshot, StockType } from "@prisma/client";
import { NextResponse } from "next/server";
import { INVENTORY_NAME_REGEX } from "../../../../utils/regex";
import { StockSnapshotPostDto } from "./currentsnapshot/stock/route";
import { InventoryType } from ".prisma/client";
import InventoryWhereUniqueInput = Prisma.InventoryWhereUniqueInput;
import { CreateStockDto } from "./stock/route";
import { v4 } from "uuid";
import { CreateBarStockDto } from "../bar/[name]/stock/route";
import { UpdateStockDto } from "./stock/[id]/route";
import { z } from "zod";
import { UpdateStockQuantityDto } from "./stock/[id]/quantity/route";

export class Either<S, E> {
    constructor(public readonly success?: S, public readonly error?: E) {
    }
}

export const fetchInventory = async (name: string, options?: {
    bar?: boolean,
    stock?: boolean,
    snapshots?: boolean,
}): Promise<Either<Inventory & {
    stock?: Stock[],
    snapshots?: InventorySnapshot[]
}, NextResponse>> => {
    let whereQuery: InventoryWhereUniqueInput = {
        name: name.toLowerCase()
    };

    whereQuery = options?.bar ? {
        ...whereQuery,
        type: InventoryType.BAR
    } : {
        ...whereQuery,
        OR: [
            { type: null },
            { type: InventoryType.DEFAULT }
        ]
    };

    const inventory = await prisma.inventory.findUnique({
        where: whereQuery,
        include: {
            stock: options?.stock || false,
            snapshots: options?.snapshots || false
        }
    });

    if (!inventory)
        return new Either<Inventory & {
            stock?: Stock[]
        }, NextResponse>(undefined, respond({
            message: `There was no inventory found with the name: ${name}`,
            init: {
                status: 404
            }
        }));

    return new Either<Inventory & {
        stock?: Stock[]
    }, NextResponse>(inventory, undefined);
};

export const fetchStockItem = async (inventoryName: string, itemId: string, inventoryType?: InventoryType): Promise<Either<Stock, NextResponse>> => {
    const fetchedInventory = await fetchInventory(inventoryName, { bar: inventoryType === InventoryType.BAR, stock: true });
    if (fetchedInventory.error)
        return new Either<Stock, NextResponse>(undefined, fetchedInventory.error);

    const inventory = fetchedInventory.success!;
    const item = inventory.stock?.find(item => item.id === itemId || item.uid === itemId);
    if (!item)
        return new Either<Stock, NextResponse>(
            undefined,
            respond({
                message: `There was no stock item found in ${inventoryName} with id: ${itemId}`,
                init: {
                    status: 404
                }
            })
        );
    return new Either<Stock, NextResponse>(item);
};

const updateStockItemDtoSchema = z.object({
    name: z.string()
}).strict();

export const updateStockItem = async (inventoryName: string, itemId: string, dto: UpdateStockDto, inventoryType?: InventoryType): Promise<Either<Stock, NextResponse>> => {
    const bodyValidated = updateStockItemDtoSchema.safeParse(dto);
    if (!bodyValidated.success)
        return new Either<Stock, NextResponse>(undefined, respondWithInit({
            message: "Invalid body!",
            validationErrors: bodyValidated,
            status: 401
        }));

    const fetchedItem = await fetchStockItem(inventoryName, itemId, inventoryType);
    if (fetchedItem.error)
        return new Either<Stock, NextResponse>(undefined, fetchedItem.error);

    const item = fetchedItem.success!;
    const validatedName = generateValidStockName(dto.name);
    if (validatedName.error)
        return new Either<Stock, NextResponse>(undefined, validatedName.error);

    const updatedStock = await prisma.stock.update({
        where: {
            id: item.id
        },
        data: {
            name: dto.name
        }
    });

    return new Either<Stock, NextResponse>(updatedStock);
};

export const deleteStockItem = async (inventoryName: string, itemId: string, inventoryType?: InventoryType): Promise<Either<Stock, NextResponse>> => {
    const fetchedItem = await fetchStockItem(inventoryName, itemId, inventoryType);
    if (fetchedItem.error)
        return fetchedItem;

    const item = fetchedItem.success!;
    const deletedItem = await prisma.stock.delete({
        where: {
            uid: item.uid
        }
    });

    // Delete item from current snapshot
    const currentSnapshot = await fetchCurrentSnapshot(inventoryName, inventoryType);
    if (currentSnapshot.error)
        return new Either<Stock, NextResponse>(undefined, currentSnapshot.error);

    await prisma.stockSnapshot.deleteMany({
        where: {
            inventorySnapshotId: currentSnapshot.success!.id,
            uid: item.uid
        }
    });

    return new Either<Stock, NextResponse>(deletedItem);
};

export type InventoryWithOptionalStock = Inventory & {
    stock?: Stock[]
}

export type InventorySnapshotWithInventoryAndStockSnapshots = InventorySnapshot & {
    inventory: Inventory & {
        stock: Stock[]
    },
    stockSnapshots: StockSnapshot[]
}
export type InventorySnapshotWithStockSnapshots = InventorySnapshot & {
    stockSnapshots: StockSnapshot[]
}

export const createStock = async (
    inventoryName: string,
    dto: CreateStockDto | CreateBarStockDto,
    inventoryType?: InventoryType
): Promise<Either<Stock, NextResponse>> => {
    const fetchedInventory = await fetchInventory(inventoryName, { bar: inventoryType === InventoryType.BAR, stock: true });
    if (fetchedInventory.error)
        return new Either<Stock, NextResponse>(undefined, fetchedInventory.error);
    const inventory = fetchedInventory.success!;

    if (!dto.name)
        return new Either<Stock, NextResponse>(undefined, respond({
            message: "Malformed body!",
            init: {
                status: 401
            }
        }));

    if (!INVENTORY_NAME_REGEX.test(dto.name))
        return new Either<Stock, NextResponse>(undefined, respond({
            message: "Invalid item name! " +
                "The item name must not be more than 30 characters. " +
                "It should also not include any special characters. " +
                "The item name must also start with a letter.",
            init: {
                status: 401
            }
        }));

    const validName = dto.name
        .toLowerCase()
        .trim()
        .replaceAll(/\s{2,}/g, " ")
        .replaceAll(/\s/g, "-");

    if (inventory.stock?.find(item => item.name === validName))
        return new Either<Stock, NextResponse>(undefined, respond({
            message: "There is already an item with that name in this inventory!",
            init: {
                status: 401
            }
        }));

    const createdStock = await prisma.stock.create({
        data: {
            name: validName,
            inventoryId: inventory.id,
            uid: v4(),
            type: "type" in dto ? dto.type : StockType.DEFAULT
        }
    });

    const createdStockSnapshot = await createStockSnapshot(inventoryName, {
        name: validName,
        type: "type" in dto ? dto.type : StockType.DEFAULT
    });

    if (createdStockSnapshot.error)
        return new Either<Stock, NextResponse>(undefined, createdStockSnapshot.error);
    return new Either<Stock, NextResponse>(createdStock);
};

export const createStockSnapshot = async (
    inventoryName: string,
    dto: StockSnapshotPostDto,
    inventoryType: InventoryType | null = null
): Promise<Either<StockSnapshot, NextResponse>> => {
    const fetchedSnapshot = await fetchCurrentSnapshot(inventoryName, inventoryType);
    if (fetchedSnapshot.error)
        return new Either<StockSnapshot, NextResponse>(undefined, fetchedSnapshot.error);

    const snapshot = fetchedSnapshot.success!;
    if (!dto.name)
        return new Either<StockSnapshot, NextResponse>(undefined, respond({
            message: "Malformed body! You must provide the name of the stock item.",
            init: {
                status: 401
            }
        }));

    const validatedItemName = generateValidStockName(dto.name);
    if (validatedItemName.error)
        return new Either<StockSnapshot, NextResponse>(undefined, validatedItemName.error);

    const validName = validatedItemName.success!;
    const originalStockItem = snapshot.inventory.stock.find(stock => stock.name === validName);
    if (!originalStockItem)
        return new Either<StockSnapshot, NextResponse>(
            undefined,
            respond({
                message: `Inventory with name "${inventoryName}" doesn't have any stock items called "${validName}"`,
                init: {
                    status: 401
                }
            })
        );

    if (snapshot.stockSnapshots.filter(stock => stock.name === validName).length)
        return new Either<StockSnapshot, NextResponse>(
            undefined,
            respond({
                message: "There is already an item with this name in the snapshot!",
                init: {
                    status: 401
                }
            })
        );

    const stockSnapshot = await prisma.stockSnapshot.create({
        data: {
            uid: originalStockItem.uid,
            name: validName,
            type: dto.type,
            quantity: 0,
            inventorySnapshotId: snapshot.id,
            inventoryId: snapshot.inventory.id
        }
    });

    return new Either<StockSnapshot, NextResponse>(stockSnapshot);
};

export const fetchCurrentSnapshot = async (name: string, type: InventoryType | null = null): Promise<Either<InventorySnapshotWithInventoryAndStockSnapshots, NextResponse>> => {
    const inventory = await prisma.inventory.findUnique({
        where: {
            name: name.toLowerCase(),
            type
        }
    });

    if (!inventory)
        return new Either<InventorySnapshot & {
            inventory: Inventory & {
                stock: Stock[]
            };
            stockSnapshots: StockSnapshot[]
        }, NextResponse>(
            undefined,
            respond({
                message: `There was no inventory found with the name: ${name}`,
                init: {
                    status: 404
                }
            })
        );

    const todaysDate = new Date();
    todaysDate.setHours(0, 0, 0, 0);
    const tommorowsDate = new Date();
    tommorowsDate.setHours(24, 0, 0, 0);

    const snapshot = await prisma.inventorySnapshot.findFirst({
        where: {
            AND: [
                {
                    uid: inventory.uid
                },
                {
                    createdAt: {
                        lte: tommorowsDate,
                        gte: todaysDate
                    }
                }
            ]
        },
        include: {
            stockSnapshots: true,
            inventory: {
                include: {
                    stock: true
                }
            }
        }
    });

    if (!snapshot) {
        const newSnapshot = await prisma.inventorySnapshot.create({
            data: {
                uid: inventory.uid,
                inventoryId: inventory.id
            },
            include: {
                stockSnapshots: true,
                inventory: {
                    include: {
                        stock: true
                    }
                }
            }
        });
        return await generateWholesomeCurrentSnapshot(inventory, newSnapshot);
    } else return await generateWholesomeCurrentSnapshot(inventory, snapshot);
};

export const fetchCurrentSnapshots = async (ids: string[]): Promise<Either<InventorySnapshotWithInventoryAndStockSnapshots[], NextResponse>> => {
    const inventories = await prisma.inventory.findMany({
        where: {
            id: {
                in: ids
            }
        },
        include: {
            stock: true
        }
    });

    if (!inventories || !inventories.length)
        return new Either<InventorySnapshotWithInventoryAndStockSnapshots[], NextResponse>(
            undefined,
            respond({
                message: `There were no inventories found with ids: ${ids.toString()}`,
                init: {
                    status: 404
                }
            })
        );

    const todaysDate = new Date();
    todaysDate.setHours(0, 0, 0, 0);
    const tommorowsDate = new Date();
    tommorowsDate.setHours(24, 0, 0, 0);

    const inventoryUids = inventories.map(inv => inv.uid);
    const snapshots = await prisma.inventorySnapshot.findMany({
        where: {
            AND: [
                {
                    uid: {
                        in: inventoryUids
                    }
                },
                {
                    createdAt: {
                        lte: tommorowsDate,
                        gte: todaysDate
                    }
                }
            ]
        },
        include: {
            stockSnapshots: true,
            inventory: {
                include: {
                    stock: true
                }
            }
        }
    });

    const allSnapshots: InventorySnapshotWithInventoryAndStockSnapshots[] = snapshots;
    if (ids.length !== snapshots.length) {
        const foundSnapshotUids = snapshots.map(snapshot => snapshot.uid);
        const missingInventories = inventories.filter(inventory => !foundSnapshotUids.includes(inventory.uid));
        const dataToInsert = missingInventories.map(inv => ({
            uid: inv.uid,
            inventoryId: inv.id
        }));

        const fetchedMissingInventories = await prisma.inventorySnapshot.createMany({
            data: dataToInsert
        }).then(() => prisma.inventorySnapshot.findMany({
            where: {
                uid: {
                    in: missingInventories.map(inv => inv.uid)
                },
                inventoryId: {
                    in: missingInventories.map(inv => inv.id)
                }
            },
            include: {
                inventory: {
                    include: {
                        stock: true
                    }
                },
                stockSnapshots: true
            }
        }));

        allSnapshots.push(...fetchedMissingInventories);
    }

    return await generateWholesomeCurrentSnapshots(allSnapshots);
};

const generateWholesomeCurrentSnapshots = async (snapshots: InventorySnapshotWithInventoryAndStockSnapshots[]): Promise<Either<InventorySnapshotWithInventoryAndStockSnapshots[], NextResponse>> => {
    const todaysDate = new Date();
    todaysDate.setHours(0, 0, 0, 0);

    let emptyStockSnapshots = snapshots.filter(snapshot => !snapshot.stockSnapshots.length);
    const nonEmptyStockSnapshots = snapshots.filter(snapshot => snapshot.stockSnapshots.length);

    // Handle  all inventory snapshots with empty stock snapshots
    const previousSnapshots = await prisma.inventorySnapshot.findMany({
        where: {
            uid: {
                in: emptyStockSnapshots.map(snapshot => snapshot.inventory.uid)
            },
            createdAt: {
                lt: todaysDate
            }
        },
        include: {
            stockSnapshots: true
        },
        orderBy: {
            createdAt: "desc"
        },
        distinct: "uid"
    });

    const latestPreviousSnapshots: InventorySnapshotWithStockSnapshots[] = [];
    emptyStockSnapshots.forEach(emptySnapshot => {
        const snap = previousSnapshots.find(snap => snap.uid === emptySnapshot.uid && snap.stockSnapshots.length);
        if (snap)
            latestPreviousSnapshots.push(snap);
    });

    const newStockSnapshots: Omit<StockSnapshot, "id">[] = [];
    latestPreviousSnapshots.forEach(snapshot => {
        newStockSnapshots.push(
            ...snapshot.stockSnapshots.map(stockSnapshot => {
                const { id, createdAt, updatedAt, inventorySnapshotId, ...validSnapshot } = stockSnapshot;
                return ({
                    ...validSnapshot,
                    createdAt: todaysDate,
                    updatedAt: todaysDate,
                    inventorySnapshotId: snapshots.find(snap => snap.uid === snapshot.uid)!.id
                });
            })
        );

    });

    const createdStockSnapshots = newStockSnapshots.length ?
        await prisma.stockSnapshot.createMany({
            data: newStockSnapshots
        }).then(() => prisma.stockSnapshot.findMany({
            where: {
                createdAt: {
                    gte: todaysDate
                }
            }
        })) : [];

    emptyStockSnapshots = emptyStockSnapshots.map(snapshot => ({
        ...snapshot,
        stockSnapshots: createdStockSnapshots.filter(stockSnapshot => stockSnapshot.inventorySnapshotId === snapshot.id)
    }));

    return new Either<InventorySnapshotWithInventoryAndStockSnapshots[], NextResponse>(
        [
            ...nonEmptyStockSnapshots,
            ...emptyStockSnapshots
        ]
    );
};

const generateWholesomeCurrentSnapshot = async (inventory: Inventory, snapshot: InventorySnapshot & {
    inventory: Inventory & {
        stock: Stock[]
    };
    stockSnapshots: StockSnapshot[]
}): Promise<Either<InventorySnapshot & {
    inventory: Inventory & {
        stock: Stock[]
    },
    stockSnapshots: StockSnapshot[]
}, NextResponse>> => {
    if (!snapshot.stockSnapshots.length) {
        // Fetch all the stock items and create a snapshot for each one based on the snapshot for the most recent date before today.
        // This will be done in-memory and not committed to the database to ensure speed.
        const todaysDate = new Date();
        todaysDate.setHours(0, 0, 0, 0);
        const previousSnapshot = await prisma.inventorySnapshot.findFirst({
            where: {
                uid: inventory.uid,
                createdAt: {
                    lt: todaysDate
                }
            },
            include: {
                stockSnapshots: true
            },
            orderBy: {
                createdAt: "desc"
            }
        });

        if (previousSnapshot) {
            const newStockSnapshots = previousSnapshot.stockSnapshots.map(stockSnapshot => {
                const { id, createdAt, updatedAt, inventorySnapshotId, ...validSnapshot } = stockSnapshot;
                return ({
                    ...validSnapshot,
                    createdAt: todaysDate,
                    updatedAt: todaysDate,
                    inventorySnapshotId: snapshot.id
                });
            });

            if (newStockSnapshots.length) {
                const createdSnapshots = await prisma.stockSnapshot.createMany({
                    data: newStockSnapshots
                }).then(() => prisma.stockSnapshot.findMany({
                    where: {
                        inventorySnapshotId: snapshot.id,
                        createdAt: {
                            gte: todaysDate
                        }
                    }
                }));

                return new Either<InventorySnapshot & {
                    inventory: Inventory & {
                        stock: Stock[]
                    };
                    stockSnapshots: StockSnapshot[]
                }, NextResponse>({
                    ...snapshot,
                    stockSnapshots: createdSnapshots
                });
            }
        }
    }

    return new Either<InventorySnapshot & {
        inventory: Inventory & {
            stock: Stock[]
        };
        stockSnapshots: StockSnapshot[]
    }, NextResponse>(snapshot);
};

const updateCurrentStockSnapshotSchema = z.object({
    name: z.string(),
    quantity: z.number().int().gte(0)
}).partial().strict();

export const updateCurrentStockSnapshot = async (
    inventoryName: string,
    itemUID: string,
    dto: Partial<UpdateStockDto & UpdateStockQuantityDto>,
    inventoryType: InventoryType | null = null
): Promise<Either<StockSnapshot, NextResponse>> => {
    const dtoValidated = updateCurrentStockSnapshotSchema.safeParse(dto);
    if (!dtoValidated.success)
        return new Either<StockSnapshot, NextResponse>(undefined, respondWithInit({
            message: "Invalid body!",
            validationErrors: dtoValidated,
            status: 401
        }));

    if (!dto.name && dto.quantity === undefined)
        return new Either<StockSnapshot, NextResponse>(undefined, respondWithInit({
            message: "You must provide some data to update!",
            status: 401
        }));

    if (dto.name) {
        const validatedName = generateValidStockName(dto.name);
        if (validatedName.error)
            return new Either<StockSnapshot, NextResponse>(undefined, validatedName.error);
        dto.name = validatedName.success!;
    }

    const currentSnapshotMiddleman = await fetchCurrentSnapshot(inventoryName, inventoryType);
    if (currentSnapshotMiddleman.error)
        return new Either<StockSnapshot, NextResponse>(undefined, currentSnapshotMiddleman.error);

    const currentSnapshot = currentSnapshotMiddleman.success!;
    const stockSnapshot = currentSnapshot.stockSnapshots.find(snapshot => snapshot.uid === itemUID);
    if (!stockSnapshot)
        return new Either<StockSnapshot, NextResponse>(undefined, respondWithInit({
            message: `There was no item with UID: ${itemUID}`,
            status: 401
        }));

    return new Either<StockSnapshot, NextResponse>(await prisma.stockSnapshot.update({
        where: {
            id: stockSnapshot.id
        },
        data: dto
    }));
};

export const generateValidInventoryName = (name: string) => {
    return generateValidName(
        name,
        INVENTORY_NAME_REGEX,
        "Invalid inventory name! " +
        "The inventory name must not be more than 30 characters. " +
        "It should also not include any special characters. " +
        "The inventory name must also start with a letter."
    );
};

export const generateValidStockName = (name: string) => {
    return generateValidName(
        name,
        INVENTORY_NAME_REGEX,
        "Invalid stock name! " +
        "The inventory name must not be more than 30 characters. " +
        "It should also not include any special characters. " +
        "The inventory name must also start with a letter."
    );
};

export const generateValidName = (name: string, regex: RegExp, errorMsg: string): Either<string, NextResponse> => {
    if (!regex.test(name))
        return new Either<string, NextResponse>(undefined, respond({
            message: errorMsg,
            init: {
                status: 401
            }
        }));

    return new Either<string, NextResponse>(
        name.toLowerCase()
            .trim()
            .replaceAll(/\s{2,}/g, " ")
            .replaceAll(/\s/g, "-")
    );
};