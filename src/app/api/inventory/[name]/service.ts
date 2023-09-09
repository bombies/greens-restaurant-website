import prisma from "../../../../libs/prisma";
import { respond, respondWithInit } from "../../../../utils/api/ApiUtils";
import {
    Inventory,
    InventorySnapshot,
    Stock,
    StockSnapshot,
    StockType
} from "@prisma/client";
import { NextResponse } from "next/server";
import { INVENTORY_ITEM_NAME_REGEX, INVENTORY_NAME_REGEX } from "../../../../utils/regex";
import { StockSnapshotPostDto } from "./currentsnapshot/stock/route";
import { InventoryType } from ".prisma/client";
import { CreateStockDto } from "./stock/route";
import { v4 } from "uuid";
import { UpdateStockDto } from "./stock/[id]/route";
import { UpdateStockQuantityDto } from "./stock/[id]/quantity/route";
import {
    InventorySnapshotWithOptionalExtras,
    InventorySnapshotWithStockSnapshots,
    InventoryWithOptionalExtras, StockWithOptionalExtras, updateCurrentStockSnapshotSchema,
    updateStockItemDtoSchema
} from "./types";
import { StockTimeSeries, TimeSeriesData } from "./insights/stock/route";


export class Either<S, E> {
    constructor(public readonly success?: S, public readonly error?: E) {
    }
}

class InventoryService {

    async fetchInventory(name: string, options?: {
        bar?: boolean,
        stock?: boolean | {
            inventory?: boolean,
            inventorySection?: boolean,
        },
        snapshots?: boolean,
        inventorySections?: boolean | {
            stock: boolean
        }
    }): Promise<Either<InventoryWithOptionalExtras, NextResponse>> {

        let inventory = await prisma.inventory.findFirst({
            where: {
                name: name.toLowerCase()
            },
            include: {
                stock: options?.stock !== undefined ? (typeof options.stock === "boolean" ? options.stock : {
                        include: {
                            inventory: "inventory" in options.stock && options.stock.inventory,
                            inventorySection: "inventorySection" in options.stock && options.stock.inventorySection
                        }
                    })
                    : false,
                snapshots: options?.snapshots ?? false,
                inventorySections: options?.inventorySections !== undefined ? (typeof options.inventorySections === "boolean" ? options.inventorySections : {
                    include: {
                        stock: "stock" in options.inventorySections && options.inventorySections.stock
                    }
                }) : false
            }
        });

        if (!inventory)
            return new Either<InventoryWithOptionalExtras, NextResponse>(undefined, respond({
                message: `There was no inventory found with the name: ${name}`,
                init: {
                    status: 404
                }
            }));

        return new Either<InventoryWithOptionalExtras, NextResponse>(inventory, undefined);
    };

    async fetchStockItem(inventoryName: string, itemId: string, inventoryType?: InventoryType): Promise<Either<Stock, NextResponse>> {
        const fetchedInventory = await this.fetchInventory(inventoryName, {
            bar: inventoryType === InventoryType.BAR,
            stock: true
        });
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

    async fetchStockItems(inventoryName?: string, itemUIDs?: string[], inventoryType?: InventoryType): Promise<Either<StockWithOptionalExtras[], NextResponse>> {
        if (!inventoryName || !itemUIDs) {
            const stock = await prisma.stock.findMany({
                include: {
                    inventory: true,
                    inventorySection: true
                }
            });
            return new Either<Stock[], NextResponse>(stock);
        }

        const fetchedInventory = await this.fetchInventory(inventoryName, {
            bar: inventoryType === InventoryType.BAR,
            stock: {
                inventory: true,
                inventorySection: true
            }
        });
        if (fetchedInventory.error)
            return new Either<StockWithOptionalExtras[], NextResponse>(undefined, fetchedInventory.error);

        const inventory = fetchedInventory.success!;
        const items = inventory.stock?.filter(item => itemUIDs.includes(item.uid));
        if (!items || !items.length)
            return new Either<StockWithOptionalExtras[], NextResponse>(
                undefined,
                respond({
                    message: `There were no stock items found in ${inventoryName} with ids: ${itemUIDs.toString()}`,
                    init: {
                        status: 404
                    }
                })
            );
        return new Either<StockWithOptionalExtras[], NextResponse>(items);
    };

    async updateStockItem(inventoryName: string, itemId: string, dto: UpdateStockDto, inventoryType?: InventoryType): Promise<Either<Stock | StockSnapshot, NextResponse>> {
        const bodyValidated = updateStockItemDtoSchema.safeParse(dto);
        if (!bodyValidated.success)
            return new Either<Stock, NextResponse>(undefined, respondWithInit({
                message: "Invalid body!",
                validationErrors: bodyValidated,
                status: 400
            }));

        const fetchedItem = await this.fetchStockItem(inventoryName, itemId, inventoryType);
        if (fetchedItem.error)
            return new Either<Stock, NextResponse>(undefined, fetchedItem.error);

        const item = fetchedItem.success!;

        if (dto.name) {
            const validatedName = this.generateValidStockName(dto.name);
            if (validatedName.error)
                return new Either<Stock, NextResponse>(undefined, validatedName.error);
            dto.name = validatedName.success!;
        }


        const updatedStock = await prisma.stock.update({
            where: {
                id: item.id
            },
            data: {
                name: dto.name,
                price: dto.price
            }
        });

        if (dto.quantity !== undefined || dto.price !== undefined || dto.name) {
            const updatedSnapshot = await this.updateCurrentStockSnapshot(
                inventoryName,
                itemId,
                dto,
                inventoryType
            );

            if (updatedSnapshot.error)
                return new Either<Stock | StockSnapshot, NextResponse>(undefined, updatedSnapshot.error);
            return new Either<StockSnapshot, NextResponse>(updatedSnapshot.success);
        }

        return new Either<Stock, NextResponse>(updatedStock);
    };

    async deleteStockItem(inventoryName: string, itemId: string, inventoryType?: InventoryType): Promise<Either<Stock, NextResponse>> {
        const fetchedItem = await this.fetchStockItem(inventoryName, itemId, inventoryType);
        if (fetchedItem.error)
            return fetchedItem;

        const item = fetchedItem.success!;
        const deletedItem = await prisma.stock.delete({
            where: {
                uid: item.uid
            }
        });

        // Delete item from current snapshot
        const currentSnapshot = await this.fetchCurrentSnapshot(inventoryName, inventoryType);
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

    async deleteStockItems(inventoryName: string, itemUIDs: string[], inventoryType?: InventoryType): Promise<Either<Stock[], NextResponse>> {
        const fetchedItem = await this.fetchStockItems(inventoryName, itemUIDs, inventoryType);
        if (fetchedItem.error)
            return fetchedItem;

        const items = fetchedItem.success!;
        await prisma.stock.deleteMany({
            where: {
                uid: {
                    in: itemUIDs
                }
            }
        });

        // Delete item from current snapshot
        const currentSnapshot = await this.fetchCurrentSnapshot(inventoryName, inventoryType);
        if (currentSnapshot.error)
            return new Either<Stock[], NextResponse>(undefined, currentSnapshot.error);

        await prisma.stockSnapshot.deleteMany({
            where: {
                inventorySnapshotId: currentSnapshot.success!.id,
                uid: {
                    in: itemUIDs
                }
            }
        });

        return new Either<Stock[], NextResponse>(items);
    };

    async createStock(
        inventoryName: string,
        dto: CreateStockDto,
        inventoryType?: InventoryType
    ): Promise<Either<Stock, NextResponse>> {
        const fetchedInventory = await this.fetchInventory(inventoryName, {
            bar: inventoryType === InventoryType.BAR,
            stock: true
        });
        if (fetchedInventory.error)
            return new Either<Stock, NextResponse>(undefined, fetchedInventory.error);
        const inventory = fetchedInventory.success!;

        if (!dto.name)
            return new Either<Stock, NextResponse>(undefined, respond({
                message: "Malformed body!",
                init: {
                    status: 400
                }
            }));

        if (!INVENTORY_ITEM_NAME_REGEX.test(dto.name))
            return new Either<Stock, NextResponse>(undefined, respond({
                message: "Invalid item name! " +
                    "The item name must not be more than 30 characters. " +
                    "The only special characters allowed are \"'\", \".\" and \"-\".",
                init: {
                    status: 400
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
                    status: 400
                }
            }));

        const createdStock = await prisma.stock.create({
            data: {
                name: validName,
                inventoryId: inventory.id,
                uid: v4(),
                type: "type" in dto ? dto.type : StockType.DEFAULT,
                price: dto.price
            }
        });

        const createdStockSnapshot = await this.createStockSnapshot(inventoryName, {
            name: validName,
            type: "type" in dto ? dto.type : StockType.DEFAULT,
            price: dto.price
        });

        if (createdStockSnapshot.error)
            return new Either<Stock, NextResponse>(undefined, createdStockSnapshot.error);
        return new Either<Stock, NextResponse>(createdStock);
    };

    async createStockSnapshot(
        inventoryName: string,
        dto: StockSnapshotPostDto,
        inventoryType: InventoryType | null = null
    ): Promise<Either<StockSnapshot, NextResponse>> {
        const fetchedSnapshot = await this.fetchCurrentSnapshot(inventoryName, inventoryType);
        if (fetchedSnapshot.error)
            return new Either<StockSnapshot, NextResponse>(undefined, fetchedSnapshot.error);

        const snapshot = fetchedSnapshot.success!;
        if (!dto.name)
            return new Either<StockSnapshot, NextResponse>(undefined, respond({
                message: "Malformed body! You must provide the name of the stock item.",
                init: {
                    status: 400
                }
            }));

        const validatedItemName = this.generateValidStockName(dto.name);
        if (validatedItemName.error)
            return new Either<StockSnapshot, NextResponse>(undefined, validatedItemName.error);

        const validName = validatedItemName.success!;
        const originalStockItem = snapshot.inventory?.stock?.find(stock => stock.name === validName);
        if (!originalStockItem)
            return new Either<StockSnapshot, NextResponse>(
                undefined,
                respond({
                    message: `Inventory with name "${inventoryName}" doesn't have any stock items called "${validName}"`,
                    init: {
                        status: 400
                    }
                })
            );

        const existingSnapshot = snapshot.stockSnapshots?.find(stockSnapshot => stockSnapshot.uid === originalStockItem.uid);
        if (existingSnapshot)
            return new Either<StockSnapshot, NextResponse>(existingSnapshot);

        const stockSnapshot = await prisma.stockSnapshot.create({
            data: {
                uid: originalStockItem.uid,
                name: originalStockItem.name,
                type: originalStockItem.type,
                price: originalStockItem.price,
                quantity: 0,
                inventorySnapshotId: snapshot.id
            }
        });

        return new Either<StockSnapshot, NextResponse>(stockSnapshot);
    };

    async fetchCurrentSnapshot(name: string, type: InventoryType | null = null): Promise<Either<InventorySnapshotWithOptionalExtras, NextResponse>> {
        let inventory = await prisma.inventory.findUnique({
            where: {
                name: name.toLowerCase()
            },
            include: {
                stock: true
            }
        });

        if (!inventory)
            return new Either<InventorySnapshotWithOptionalExtras, NextResponse>(
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
            return await this.generateWholesomeCurrentSnapshot(inventory, newSnapshot);
        } else return await this.generateWholesomeCurrentSnapshot(inventory, snapshot);
    };

    async fetchCurrentSnapshots(ids: string[]): Promise<Either<InventorySnapshotWithOptionalExtras[], NextResponse>> {
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
            return new Either<InventorySnapshotWithOptionalExtras[], NextResponse>(
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

        const allSnapshots: InventorySnapshotWithOptionalExtras[] = snapshots;
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

        return await this.generateWholesomeCurrentSnapshots(allSnapshots);
    };

    private async generateWholesomeCurrentSnapshots(snapshots: InventorySnapshotWithOptionalExtras[]): Promise<Either<InventorySnapshotWithOptionalExtras[], NextResponse>> {
        const todaysDate = new Date();
        todaysDate.setHours(0, 0, 0, 0);

        let emptyStockSnapshots = snapshots.filter(snapshot => snapshot.stockSnapshots?.length === 0);
        const nonEmptyStockSnapshots = snapshots.filter(snapshot => snapshot.stockSnapshots?.length);

        // Handle  all inventory snapshots with empty stock snapshots
        const previousSnapshots = await prisma.inventorySnapshot.findMany({
            where: {
                uid: {
                    in: emptyStockSnapshots.map(snapshot => snapshot.inventory!.uid)
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

        return new Either<InventorySnapshotWithOptionalExtras[], NextResponse>(
            [
                ...nonEmptyStockSnapshots,
                ...emptyStockSnapshots
            ]
        );
    };

    private async generateWholesomeCurrentSnapshot(inventory: InventoryWithOptionalExtras, snapshot: InventorySnapshot & {
        inventory: Inventory & {
            stock: Stock[]
        };
        stockSnapshots: StockSnapshot[]
    }): Promise<Either<InventorySnapshot & {
        inventory: Inventory & {
            stock: Stock[]
        },
        stockSnapshots: StockSnapshot[]
    }, NextResponse>> {
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

            const newStockSnapshots = previousSnapshot?.stockSnapshots.map(stockSnapshot => {
                const { id, createdAt, updatedAt, inventorySnapshotId, ...validSnapshot } = stockSnapshot;
                return ({
                    ...validSnapshot,
                    createdAt: todaysDate,
                    updatedAt: todaysDate,
                    inventorySnapshotId: snapshot.id
                });
            }) ?? inventory.stock?.map(inventoryStockItem => {
                const {
                    id,
                    createdAt,
                    updatedAt,
                    inventoryId,
                    inventorySectionId,
                    assignedInventoryIds,
                    assignedInventorySectionIds,
                    ...validSnapshot
                } = inventoryStockItem;
                return ({
                    ...validSnapshot,
                    quantity: 0,
                    createdAt: todaysDate,
                    updatedAt: todaysDate,
                    inventorySnapshotId: snapshot.id
                });
            }) ?? [];

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

        return new Either<InventorySnapshot & {
            inventory: Inventory & {
                stock: Stock[]
            };
            stockSnapshots: StockSnapshot[]
        }, NextResponse>(snapshot);
    };

    async updateCurrentStockSnapshot(
        inventoryName: string,
        itemUID: string,
        dto: Partial<UpdateStockDto & UpdateStockQuantityDto>,
        inventoryType: InventoryType | null = null
    ): Promise<Either<StockSnapshot, NextResponse>> {
        const dtoValidated = updateCurrentStockSnapshotSchema.safeParse(dto);
        if (!dtoValidated.success)
            return new Either<StockSnapshot, NextResponse>(undefined, respondWithInit({
                message: "Invalid body!",
                validationErrors: dtoValidated,
                status: 400
            }));

        if (!dto.name && dto.quantity === undefined && dto.price === undefined && dto.type === undefined)
            return new Either<StockSnapshot, NextResponse>(undefined, respondWithInit({
                message: "You must provide some data to update!",
                status: 400
            }));

        if (dto.name) {
            const validatedName = this.generateValidStockName(dto.name);
            if (validatedName.error)
                return new Either<StockSnapshot, NextResponse>(undefined, validatedName.error);
            dto.name = validatedName.success!;
        }

        const currentSnapshotMiddleman = await this.fetchCurrentSnapshot(inventoryName, inventoryType);
        if (currentSnapshotMiddleman.error)
            return new Either<StockSnapshot, NextResponse>(undefined, currentSnapshotMiddleman.error);

        const currentSnapshot = currentSnapshotMiddleman.success!;
        const stockSnapshot = currentSnapshot.stockSnapshots?.find(snapshot => snapshot.uid === itemUID);
        if (!stockSnapshot)
            return new Either<StockSnapshot, NextResponse>(undefined, respondWithInit({
                message: `There was no item with UID: ${itemUID}`,
                status: 400
            }));

        return new Either<StockSnapshot, NextResponse>(await prisma.stockSnapshot.update({
            where: {
                id: stockSnapshot.id
            },
            data: dto
        }));
    };

    async fetchInsightsData(inventoryName: string): Promise<Either<StockTimeSeries[], NextResponse>> {
        const inventory = await inventoryService.fetchInventory(inventoryName, {
            inventorySections: true
        });
        if (inventory.error)
            return new Either<StockTimeSeries[], NextResponse>(undefined, inventory.error);

        const stock = await prisma.stock.findMany({
            where: {
                OR: [
                    {
                        inventoryId: inventory.success!.id
                    },
                    {
                        inventorySectionId: {
                            in: inventory.success!.inventorySections?.map(section => section.id)
                        }
                    }
                ]
            }
        });

        const stockSnapshots = await prisma.stockSnapshot.findMany({
            where: {
                OR: [
                    {
                        inventorySnapshot: {
                            inventoryId: inventory.success!.id
                        }
                    },
                    {
                        inventorySectionSnapshot: {
                            inventorySectionId: {
                                in: inventory.success!.inventorySections?.map(section => section.id)
                            }
                        }
                    }
                ]
            }
        });

        const data: StockTimeSeries[] = stock.map(item => {
            const itemSnapshots = stockSnapshots.filter(snapshotItem => snapshotItem.uid === item.uid);
            const timeData: TimeSeriesData[] = itemSnapshots.map(snapshot => ({
                date: new Date(snapshot.createdAt.setHours(0, 0, 0, 0)),
                value: snapshot.quantity
            }));

            return ({
                name: item.name,
                data: timeData
            });
        });

        return new Either<StockTimeSeries[], NextResponse>(data);
    }

    generateValidInventoryName(name: string) {
        return this.generateValidName(
            name,
            INVENTORY_NAME_REGEX,
            "Invalid inventory name! " +
            "The inventory name must not be more than 30 characters. " +
            "It should also not include any special characters. " +
            "The inventory name must also start with a letter."
        );
    };

    generateValidStockName(name: string) {
        return this.generateValidName(
            name,
            INVENTORY_ITEM_NAME_REGEX,
            "Invalid stock name! " +
            "The inventory name must not be more than 30 characters. " +
            "The only special characters allowed are \"'\", \".\" and \"-\"."
        );
    };

    generateValidName(name: string, regex: RegExp, errorMsg: string): Either<string, NextResponse> {
        if (!regex.test(name))
            return new Either<string, NextResponse>(undefined, respond({
                message: errorMsg,
                init: {
                    status: 400
                }
            }));

        return new Either<string, NextResponse>(
            name.toLowerCase()
                .trim()
                .replaceAll(/\s{2,}/g, " ")
                .replaceAll(/\s/g, "-")
        );
    };
}

const inventoryService = new InventoryService();
export default inventoryService;