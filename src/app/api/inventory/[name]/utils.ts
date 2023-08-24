import prisma from "../../../../libs/prisma";
import { respond } from "../../../../utils/api/ApiUtils";
import { Inventory, InventorySnapshot, Stock, StockSnapshot } from "@prisma/client";
import { NextResponse } from "next/server";
import { INVENTORY_NAME_REGEX } from "../../../../utils/regex";
import { StockSnapshotPostDto } from "./currentsnapshot/stock/route";

export class Either<S, E> {
    constructor(public readonly success?: S, public readonly error?: E) {
    }
}

export const fetchInventory = async (name: string, options?: {
    stock?: boolean,
    snapshots?: boolean,
}): Promise<Either<Inventory & { stock?: Stock[], snapshots?: InventorySnapshot[] }, NextResponse>> => {
    const inventory = await prisma.inventory.findUnique({
        where: {
            name: name.toLowerCase()
        },
        include: {
            stock: options?.stock || false,
            snapshots: options?.snapshots || false
        }
    });

    if (!inventory)
        return new Either<Inventory & { stock?: Stock[] }, NextResponse>(undefined, respond({
            message: `There was no inventory found with the name: ${name}`,
            init: {
                status: 404
            }
        }));

    return new Either<Inventory & { stock?: Stock[] }, NextResponse>(inventory, undefined);
};

export const fetchStockItem = async (inventoryName: string, itemId: string): Promise<Either<Stock, NextResponse>> => {
    const fetchedInventory = await fetchInventory(inventoryName, { stock: true });
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

export type InventoryWithOptionalStock = Inventory & {
    stock?: Stock[]
}

export type InventorySnapshotWithInventoryAndStockSnapshots = InventorySnapshot & {
    inventory: Inventory & { stock: Stock[] },
    stockSnapshots: StockSnapshot[]
}
export type InventorySnapshotWithStockSnapshots = InventorySnapshot & {
    stockSnapshots: StockSnapshot[]
}


export const fetchCurrentSnapshot = async (name: string): Promise<Either<InventorySnapshotWithInventoryAndStockSnapshots, NextResponse>> => {
    const inventory = await prisma.inventory.findUnique({
        where: {
            name: name.toLowerCase()
        }
    });

    if (!inventory)
        return new Either<InventorySnapshot & {
            inventory: Inventory & { stock: Stock[] };
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

        await prisma.inventorySnapshot.createMany({
            data: dataToInsert
        });

        allSnapshots.push(...dataToInsert.map(data => {
            const correspondingInventory = inventories.find(inv => inv.uid === data.uid)!;
            return ({
                ...data,
                id: "",
                createdAt: new Date(),
                updatedAt: new Date(),
                inventory: correspondingInventory,
                stockSnapshots: []
            });
        }));
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
        }
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

    if (newStockSnapshots.length) {
        await prisma.stockSnapshot.createMany({
            data: newStockSnapshots
        });
    }

    emptyStockSnapshots = emptyStockSnapshots.map(snapshot => ({
        ...snapshot,
        stockSnapshots: newStockSnapshots
            .filter(newSnapshot => newSnapshot.inventorySnapshotId === snapshot.id)
            .map(snapshot => ({ ...snapshot, id: "" }))
    }));

    return new Either<InventorySnapshotWithInventoryAndStockSnapshots[], NextResponse>(
        [
            ...nonEmptyStockSnapshots,
            ...emptyStockSnapshots
        ]
    );
};

const generateWholesomeCurrentSnapshot = async (inventory: Inventory, snapshot: InventorySnapshot & {
    inventory: Inventory & { stock: Stock[] };
    stockSnapshots: StockSnapshot[]
}): Promise<Either<InventorySnapshot & {
    inventory: Inventory & { stock: Stock[] },
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

            await prisma.stockSnapshot.createMany({
                data: newStockSnapshots
            });

            return new Either<InventorySnapshot & {
                inventory: Inventory & { stock: Stock[] };
                stockSnapshots: StockSnapshot[]
            }, NextResponse>({
                ...snapshot,
                stockSnapshots: newStockSnapshots.map(snapshot => ({ ...snapshot, id: "" }))
            });
        }
    }

    return new Either<InventorySnapshot & {
        inventory: Inventory & { stock: Stock[] };
        stockSnapshots: StockSnapshot[]
    }, NextResponse>(snapshot);
};

export const createStockSnapshot = async (
    inventoryName: string,
    dto: StockSnapshotPostDto
): Promise<Either<StockSnapshot, NextResponse>> => {
    const fetchedSnapshot = await fetchCurrentSnapshot(inventoryName);
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
            quantity: 0,
            inventorySnapshotId: snapshot.id,
            inventoryId: snapshot.inventory.id
        }
    });

    return new Either<StockSnapshot, NextResponse>(stockSnapshot);
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