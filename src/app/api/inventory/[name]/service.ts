import prisma from "../../../../libs/prisma";
import { respond, respondWithInit } from "../../../../utils/api/ApiUtils";
import {
    Inventory, InventorySection,
    InventorySnapshot, Prisma,
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
    CreateInventoryDto,
    createInventoryDtoSchema,
    InventorySnapshotWithOptionalExtras,
    InventorySnapshotWithStockSnapshots,
    InventoryWithOptionalExtras, StockWithOptionalExtras, updateCurrentStockSnapshotSchema,
    updateStockItemDtoSchema
} from "./types";
import { StockTimeSeries, TimeSeriesData } from "./insights/stock/route";
import {
    InventorySectionsSnapshot,
    CreateInventorySectionDto,
    createInventorySectionDtoSchema, InventorySectionSnapshotWithOptionalExtras,
    InventorySectionWithOptionalExtras, UpdateInventorySectionDto, updateInventorySectionDtoSchema
} from "../location/[name]/types";
import { UpdateLocationSectionStockDto } from "../location/[name]/[sectionId]/stock/[stockUID]/route";
import { z } from "zod";
import { AddLocationStockDto } from "../location/[name]/[sectionId]/stock/route";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import StockSnapshotCreateManyInput = Prisma.StockSnapshotCreateManyInput;
import { Session } from "next-auth";
import configService from "../../config/service";
import { itemHasLowStock } from "@/app/(site)/(accessible-site)/inventory/utils/inventory-utils";

export class Either<S, E> {
    constructor(public readonly success?: S, public readonly error?: E) {
    }
}

class InventoryService {

    async createInventory(body: CreateInventoryDto, session: Session): Promise<Either<Inventory, NextResponse>> {
        const bodyValidated = createInventoryDtoSchema.safeParse(body);
        if (!bodyValidated.success)
            return new Either<Inventory, NextResponse>(undefined, respondWithInit({
                message: "Invalid body!",
                validationErrors: bodyValidated,
                status: 400
            }));

        const { name, createdBy } = body;
        if (!INVENTORY_NAME_REGEX.test(name))
            return new Either<Inventory, NextResponse>(undefined, respond({
                message: "Invalid inventory name! " +
                    "The inventory name must not be more than 30 characters. " +
                    "It should also not include any special characters. " +
                    "The inventory name must also start with a letter.",
                init: {
                    status: 400
                }
            }));

        const validName = name
            .toLowerCase()
            .trim()
            .replaceAll(/\s{2,}/g, " ")
            .replaceAll(" ", "-");

        const inventoryQuery = body.type === InventoryType.LOCATION ? {
            type: InventoryType.LOCATION
        } : {
            OR: [
                { type: body.type },
                { type: { isSet: false } }
            ]
        };
        const existingInventory = await prisma.inventory.findUnique({
            where: {
                name: validName,
                ...inventoryQuery
            }
        });

        if (existingInventory)
            return new Either<Inventory, NextResponse>(undefined, respond({
                message: `There is already an inventory with the name: ${validName.replaceAll("-", " ")}`,
                init: {
                    status: 400
                }
            }));

        const inventory = await prisma.inventory.create({
            data: {
                name: validName,
                type: body.type ?? InventoryType.DEFAULT,
                uid: v4(),
                createdByUserId: createdBy ?? session.user!.id
            }
        });

        return new Either<Inventory, NextResponse>(inventory);
    }

    async fetchInventory(name: string, options?: {
        location?: boolean,
        stock?: boolean | {
            inventory?: boolean,
            inventorySection?: boolean,
        },
        snapshots?: boolean,
        inventorySections?: boolean | {
            stock: boolean
        }
    }): Promise<Either<InventoryWithOptionalExtras, NextResponse>> {
        const inventory = await this.fetchInventoryHeadless(name, options);

        if (!inventory)
            return new Either<InventoryWithOptionalExtras, NextResponse>(undefined, respond({
                message: `There was no inventory found with the name: ${name}`,
                init: {
                    status: 404
                }
            }));

        return new Either<InventoryWithOptionalExtras, NextResponse>(inventory, undefined);
    };

    async fetchInventoryHeadless(name: string, options?: {
        location?: boolean,
        stock?: boolean | {
            inventory?: boolean,
            inventorySection?: boolean,
        },
        snapshots?: boolean,
        inventorySections?: boolean | {
            stock: boolean
        }
    }) {
        return await prisma.inventory.findFirst({
            where: {
                name: name.toLowerCase(),
                type: options?.location ? InventoryType.LOCATION : undefined
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
    }

    async fetchStockItem(inventoryName: string, itemId: string, inventoryType?: InventoryType): Promise<Either<Stock, NextResponse>> {
        const fetchedInventory = await this.fetchInventory(inventoryName, {
            location: inventoryType === InventoryType.LOCATION,
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
            location: inventoryType === InventoryType.LOCATION,
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
                price: dto.price,
                type: dto.type
            }
        });

        if (dto.quantity !== undefined || dto.price !== undefined || dto.name || dto.type) {
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
            location: inventoryType === InventoryType.LOCATION,
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
        const currentSnapshot = await this.fetchCurrentSnapshotHeadless(name, type);
        if (!currentSnapshot)
            return new Either<InventorySnapshotWithOptionalExtras, NextResponse>(undefined, respond({
                message: `There was no current inventory found with the name: ${name}`,
                init: {
                    status: 404
                }
            }));
        return new Either<InventorySnapshotWithOptionalExtras, NextResponse>(currentSnapshot);
    };

    async fetchCurrentSnapshotHeadless(name: string, type: InventoryType | null = null) {
        let inventory = await prisma.inventory.findUnique({
            where: {
                name: name.toLowerCase()
            },
            include: {
                stock: true
            }
        });

        if (!inventory)
            return undefined;

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
            return await this.generateWholesomeCurrentSnapshotHeadless(inventory, newSnapshot);
        } else return await this.generateWholesomeCurrentSnapshotHeadless(inventory, snapshot);
    }

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

    private async generateWholesomeCurrentSnapshotHeadless(inventory: InventoryWithOptionalExtras, snapshot: InventorySnapshot & {
        inventory: Inventory & {
            stock: Stock[]
        };
        stockSnapshots: StockSnapshot[]
    }) {
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

                return ({
                    ...snapshot,
                    stockSnapshots: createdSnapshots
                })
            }
        }

        return snapshot;
    }

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
        return new Either<InventorySnapshot & {
            inventory: Inventory & {
                stock: Stock[]
            };
            stockSnapshots: StockSnapshot[]
        }, NextResponse>(await this.generateWholesomeCurrentSnapshotHeadless(inventory, snapshot));
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

    async fetchLowStock(inventoryName: string) {
        const fetchedSnapshot = await this.fetchCurrentSnapshot(inventoryName);
        if (fetchedSnapshot.error)
            return [];

        const snapshot = fetchedSnapshot.success!;
        const config = await configService.getConfig();
        const lowStockItems: StockSnapshot[] = [];

        snapshot.stockSnapshots?.forEach((item) => {
            if (itemHasLowStock(config, item))
                lowStockItems.push(item);
        });

        return lowStockItems;
    }

    async fetchInsightsData(inventoryName: string, location: boolean = false): Promise<Either<StockTimeSeries[], NextResponse>> {
        const inventory = await inventoryService.fetchInventory(inventoryName, {
            inventorySections: true,
            location
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
                    },
                    {
                        assignedInventorySectionIds: {
                            hasSome: inventory.success!.inventorySections?.map(section => section.id)
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

    public async fetchInventorySections(inventoryName: string, type: InventoryType = InventoryType.DEFAULT): Promise<Either<InventorySectionWithOptionalExtras[], NextResponse>> {
        const inventoryMiddleman = await inventoryService.fetchInventory(inventoryName, {
            location: type === InventoryType.LOCATION,
            inventorySections: true
        });
        if (inventoryMiddleman.error)
            return new Either<InventorySectionWithOptionalExtras[], NextResponse>(undefined, inventoryMiddleman.error);
        const inventory = inventoryMiddleman.success!;
        return new Either<InventorySectionWithOptionalExtras[], NextResponse>(inventory.inventorySections ?? []);
    }

    public async fetchInventorySection(sectionId: string, withStock: boolean = false): Promise<Either<InventorySectionWithOptionalExtras, NextResponse>> {
        const inventorySection = await prisma.inventorySection.findUnique({
            where: {
                id: sectionId
            },
            include: {
                stock: withStock,
                assignedStock: withStock
            }
        });

        if (!inventorySection)
            return new Either<InventorySectionWithOptionalExtras, NextResponse>(undefined, respondWithInit({
                message: `There is no inventory section with the id ${sectionId}`,
                status: 404
            }));

        return new Either<InventorySectionWithOptionalExtras, NextResponse>(inventorySection);
    }

    public async createInventorySection(inventoryName: string, dto: CreateInventorySectionDto, type: InventoryType = InventoryType.DEFAULT): Promise<Either<InventorySectionWithOptionalExtras, NextResponse>> {
        const dtoValidated = createInventorySectionDtoSchema.safeParse(dto);
        if (!dtoValidated.success)
            return new Either<InventorySection, NextResponse>(undefined, respondWithInit({
                message: "Invalid body!",
                validationErrors: dtoValidated,
                status: 400
            }));

        const inventoryMiddleman = await inventoryService.fetchInventory(inventoryName, { location: type === InventoryType.LOCATION });
        if (inventoryMiddleman.error)
            return new Either<InventorySection, NextResponse>(undefined, inventoryMiddleman.error);
        const inventory = inventoryMiddleman.success!;

        const existingSection = await prisma.inventorySection.findFirst({
            where: {
                name: {
                    equals: dto.name,
                    mode: "insensitive"
                },
                inventory: {
                    id: inventory.id,
                    type: InventoryType.LOCATION
                }
            }
        });

        if (existingSection)
            return new Either<InventorySection, NextResponse>(undefined, respondWithInit({
                message: `There is already an existing section in ${inventoryName} called ${dto.name}!`,
                status: 400
            }));

        const createdSection = await prisma.inventorySection.create({
            data: {
                name: dto.name,
                uid: v4(),
                inventoryId: inventory.id
            },
            include: {
                inventory: true
            }
        });

        return new Either<InventorySectionWithOptionalExtras, NextResponse>(createdSection);
    }

    public async updateInventorySection(sectionId: string, dto: UpdateInventorySectionDto): Promise<Either<InventorySectionWithOptionalExtras, NextResponse>> {
        return this.handlePrismaErrors(async () => {
            const dtoValidated = updateInventorySectionDtoSchema.safeParse(dto);
            if (!dtoValidated.success)
                return new Either<InventorySection, NextResponse>(undefined, respondWithInit({
                    message: "Invalid body!",
                    validationErrors: dtoValidated,
                    status: 400
                }));

            const updatedSection = await prisma.inventorySection.update({
                where: {
                    id: sectionId
                },
                data: dto,
                include: {
                    inventory: true
                }
            });

            return new Either<InventorySectionWithOptionalExtras, NextResponse>(updatedSection);
        }, {
            notFound: `There was no inventory section with id ${sectionId}`
        });
    }

    public async deleteInventorySection(sectionId: string): Promise<Either<InventorySectionWithOptionalExtras, NextResponse>> {
        return this.handlePrismaErrors(async () => {
            const deletedSection = await prisma.inventorySection.delete({
                where: {
                    id: sectionId
                }
            });

            return new Either<InventorySectionWithOptionalExtras, NextResponse>(deletedSection);
        }, {
            notFound: `There is no inventory section with id ${sectionId}`
        });
    }

    public async fetchCurrentSectionSnapshot(sectionId: string): Promise<Either<InventorySectionSnapshotWithOptionalExtras, NextResponse>> {
        const inventorySection = await prisma.inventorySection.findUnique({
            where: {
                id: sectionId
            },
            include: {
                stock: true,
                assignedStock: true
            }
        });

        if (!inventorySection)
            return new Either<InventorySectionSnapshotWithOptionalExtras, NextResponse>(undefined, respondWithInit({
                message: `There was so inventory section found with the id: ${sectionId}`,
                status: 404
            }));

        const snapshot = await this.fetchCurrentSnapshotRaw(inventorySection);
        if (!snapshot) {
            const newSnapshot = await prisma.inventorySectionSnapshot.create({
                data: {
                    uid: inventorySection.uid,
                    inventorySectionId: inventorySection.id
                },
                include: {
                    stockSnapshots: true,
                    inventorySection: {
                        include: {
                            stock: true,
                            inventory: true
                        }
                    }
                }
            });
            return await this.generateWholesomeCurrentSectionSnapshot(inventorySection, newSnapshot);
        } else return await this.generateWholesomeCurrentSectionSnapshot(inventorySection, snapshot);
    }

    public async fetchCurrentSectionSnapshots({ inventoryName, sectionIds }: {
        inventoryName?: string,
        sectionIds?: string[]
    }): Promise<Either<InventorySectionSnapshotWithOptionalExtras[], NextResponse>> {
        const inventorySections = await prisma.inventorySection.findMany({
            where: {
                id: sectionIds && {
                    in: sectionIds
                },
                inventory: inventoryName ? {
                    name: inventoryName
                } : undefined
            },
            include: {
                stock: true
            }
        });

        if (!inventorySections || !inventorySections.length)
            return new Either<InventorySectionSnapshotWithOptionalExtras[], NextResponse>(undefined, respondWithInit({
                message: `There was no inventory sections found with the ids: ${sectionIds}`,
                status: 404
            }));

        const snapshots = await this.fetchCurrentSnapshotsRaw(inventorySections);
        const allSnapshots: InventorySectionSnapshotWithOptionalExtras[] = snapshots;
        if (sectionIds && sectionIds.length !== snapshots.length) {
            const foundSnapshotUids = snapshots.map(snapshot => snapshot.uid);
            const missingInventories = inventorySections.filter(inventorySection => !foundSnapshotUids.includes(inventorySection.uid));
            const dataToInsert = missingInventories.map(inv => ({
                uid: inv.uid,
                inventorySectionId: inv.id
            }));

            const fetchedMissingInventories = await prisma.inventorySectionSnapshot.createMany({
                data: dataToInsert
            }).then(() => prisma.inventorySectionSnapshot.findMany({
                where: {
                    uid: {
                        in: missingInventories.map(inv => inv.uid)
                    },
                    inventorySectionId: {
                        in: missingInventories.map(inv => inv.id)
                    }
                },
                include: {
                    inventorySection: {
                        include: {
                            stock: true
                        }
                    },
                    stockSnapshots: true
                }
            }));

            allSnapshots.push(...fetchedMissingInventories);
        }

        return await this.generateWholesomeCurrentSectionSnapshots(allSnapshots);
    }

    async fetchMostRecentSnapshot(sectionId: string): Promise<Either<InventorySectionSnapshotWithOptionalExtras, NextResponse>> {
        const inventorySection = await prisma.inventorySection.findUnique({
            where: {
                id: sectionId
            },
            include: {
                stock: true
            }
        });

        if (!inventorySection)
            return new Either<InventorySectionSnapshotWithOptionalExtras, NextResponse>(undefined, respondWithInit({
                message: `There was so inventory section found with the id: ${sectionId}`,
                status: 404
            }));

        const snapshot = await this.fetchMostRecentSnapshotRaw(inventorySection);
        if (!snapshot)
            return new Either<InventorySectionSnapshotWithOptionalExtras, NextResponse>(undefined, respondWithInit({
                message: `There is no earlier snapshots for section with ID: ${sectionId}`,
                status: 404
            }));
        return new Either<InventorySectionSnapshotWithOptionalExtras, NextResponse>(snapshot);
    }

    async fetchMostRecentSnapshots({ sectionIds, inventoryName, type }: {
        sectionIds?: string[],
        inventoryName?: string,
        type?: InventoryType
    }): Promise<Either<InventorySectionSnapshotWithOptionalExtras[], NextResponse>> {
        let validInventoryName = inventoryService.generateValidInventoryName(inventoryName ?? "");
        if (inventoryName && validInventoryName.error)
            return new Either<InventorySectionSnapshotWithOptionalExtras[], NextResponse>(undefined, validInventoryName.error);

        const inventoryQuery = type === InventoryType.LOCATION ? {
            type: InventoryType.LOCATION
        } : {
            OR: [
                { type },
                { type: { isSet: false } }
            ]
        };

        const inventorySections = await prisma.inventorySection.findMany({
            where: {
                id: sectionIds ? {
                    in: sectionIds
                } : undefined,
                inventory: inventoryName ? {
                    name: validInventoryName.success,
                    ...inventoryQuery
                } : undefined
            },
            include: {
                stock: true
            }
        });

        if (!inventorySections || !inventorySections.length)
            return new Either<InventorySectionSnapshotWithOptionalExtras[], NextResponse>(undefined, respondWithInit({
                message: `There was no inventory section found with the ids: ${sectionIds}`,
                status: 404
            }));

        const snapshots = await this.fetchMostRecentSnapshotsRaw(inventorySections);
        if (!snapshots)
            return new Either<InventorySectionSnapshotWithOptionalExtras[], NextResponse>(undefined, respondWithInit({
                message: `There is no earlier snapshots for section with IDs: ${sectionIds}`,
                status: 404
            }));
        return new Either<InventorySectionSnapshotWithOptionalExtras[], NextResponse>(snapshots);
    }

    private async fetchCurrentSnapshotRaw(inventorySection: InventorySection): Promise<InventorySectionSnapshotWithOptionalExtras | null> {
        const todaysDate = new Date();
        todaysDate.setHours(0, 0, 0, 0);
        const tommorowsDate = new Date();
        tommorowsDate.setHours(24, 0, 0, 0);

        return prisma.inventorySectionSnapshot.findFirst({
            where: {
                AND: [
                    {
                        uid: inventorySection.uid
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
                inventorySection: {
                    include: {
                        stock: true,
                        inventory: true,
                        assignedStock: true
                    }
                }
            }
        });
    }

    private async fetchCurrentSnapshotsRaw(inventorySections: InventorySection[]): Promise<InventorySectionSnapshotWithOptionalExtras[]> {
        const todaysDate = new Date();
        todaysDate.setHours(0, 0, 0, 0);
        const tommorowsDate = new Date();
        tommorowsDate.setHours(24, 0, 0, 0);

        return prisma.inventorySectionSnapshot.findMany({
            where: {
                AND: [
                    {
                        uid: {
                            in: inventorySections.map(section => section.uid)
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
                inventorySection: {
                    include: {
                        stock: true,
                        inventory: true
                    }
                }
            }
        });
    }

    private async fetchMostRecentSnapshotRaw(inventorySection: InventorySection): Promise<InventorySectionSnapshotWithOptionalExtras | null> {
        const todaysDate = new Date();
        todaysDate.setHours(0, 0, 0, 0);

        return prisma.inventorySectionSnapshot.findFirst({
            where: {
                AND: [
                    {
                        uid: inventorySection.uid
                    },
                    {
                        createdAt: {
                            lt: todaysDate
                        }
                    }
                ]
            },
            include: {
                stockSnapshots: true,
                inventorySection: {
                    include: {
                        stock: true,
                        inventory: true
                    }
                }
            }
        });
    }

    private async fetchMostRecentSnapshotsRaw(inventorySections: InventorySection[]): Promise<InventorySectionSnapshotWithOptionalExtras[]> {
        const todaysDate = new Date();
        todaysDate.setHours(0, 0, 0, 0);

        return prisma.inventorySectionSnapshot.findMany({
            where: {
                AND: [
                    {
                        uid: {
                            in: inventorySections.map(section => section.uid)
                        }
                    },
                    {
                        createdAt: {
                            lte: todaysDate
                        }
                    }
                ]
            },
            orderBy: [
                {
                    createdAt: "desc"
                }
            ],
            distinct: "uid",
            include: {
                stockSnapshots: true,
                inventorySection: {
                    include: {
                        stock: true,
                        inventory: true
                    }
                }
            }
        });
    }

    private async generateWholesomeCurrentSectionSnapshot(
        section: InventorySectionWithOptionalExtras,
        snapshot: InventorySectionSnapshotWithOptionalExtras
    ): Promise<Either<InventorySectionSnapshotWithOptionalExtras, NextResponse>> {
        if (!snapshot.stockSnapshots?.length) {
            // Fetch all the stock items and create a snapshot for each one based on the snapshot for the most recent date before today.
            // This will be done in-memory and not committed to the database to ensure speed.
            const todaysDate = new Date();
            todaysDate.setHours(0, 0, 0, 0);
            const previousSnapshot = await prisma.inventorySectionSnapshot.findFirst({
                where: {
                    uid: section.uid,
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

            const newStockSnapshots = previousSnapshot?.stockSnapshots.map<StockSnapshotCreateManyInput>(stockSnapshot => {
                const { id, createdAt, updatedAt, inventorySnapshotId, ...validSnapshot } = stockSnapshot;
                return ({
                    ...validSnapshot,
                    createdAt: todaysDate,
                    updatedAt: todaysDate,
                    inventorySectionSnapshotId: snapshot.id
                });
            }) ?? section.stock?.map(sectionStockItem => {
                const {
                    id,
                    createdAt,
                    updatedAt,
                    inventoryId,
                    inventorySectionId,
                    ...validSnapshot
                } = sectionStockItem;
                return ({
                    ...validSnapshot,
                    quantity: 0,
                    createdAt: todaysDate,
                    updatedAt: todaysDate,
                    inventorySectionSnapshotId: snapshot.id
                });
            }) ?? [];

            if (newStockSnapshots.length) {
                const createdSnapshots = await prisma.stockSnapshot.createMany({
                    data: newStockSnapshots
                }).then(() => prisma.stockSnapshot.findMany({
                    where: {
                        inventorySectionSnapshotId: snapshot.id,
                        createdAt: {
                            gte: todaysDate
                        }
                    }
                }));

                return new Either<InventorySectionSnapshotWithOptionalExtras, NextResponse>({
                    ...snapshot,
                    stockSnapshots: createdSnapshots
                });
            }
        }

        return new Either<InventorySectionSnapshotWithOptionalExtras, NextResponse>(snapshot);
    }

    private async generateWholesomeCurrentSectionSnapshots(snapshots: InventorySectionSnapshotWithOptionalExtras[]): Promise<Either<InventorySectionSnapshotWithOptionalExtras[], NextResponse>> {
        const todaysDate = new Date();
        todaysDate.setHours(0, 0, 0, 0);

        let emptyStockSnapshots = snapshots.filter(snapshot => snapshot.stockSnapshots?.length === 0);
        const nonEmptyStockSnapshots = snapshots.filter(snapshot => snapshot.stockSnapshots?.length);

        const previousSnapshots = await prisma.inventorySectionSnapshot.findMany({
            where: {
                uid: {
                    in: emptyStockSnapshots.map(snapshot => snapshot.inventorySection!.uid)
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

        const latestPreviousSnapshots: InventorySectionSnapshotWithOptionalExtras[] = [];
        emptyStockSnapshots.forEach(emptySnapshot => {
            const snap = previousSnapshots.find(snap => snap.uid === emptySnapshot.uid && snap.stockSnapshots.length);
            if (snap)
                latestPreviousSnapshots.push(snap);
        });

        const newStockSnapshots: Omit<StockSnapshot, "id">[] = [];
        latestPreviousSnapshots.forEach(snapshot => {
            if (snapshot.stockSnapshots)
                newStockSnapshots.push(
                    ...snapshot.stockSnapshots.map(stockSnapshot => {
                        const { id, createdAt, updatedAt, inventorySnapshotId, ...validSnapshot } = stockSnapshot;
                        return ({
                            ...validSnapshot,
                            createdAt: todaysDate,
                            updatedAt: todaysDate,
                            inventorySectionSnapshotId: snapshot.id,
                            inventorySnapshotId: null
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

        return new Either<InventorySectionSnapshotWithOptionalExtras[], NextResponse>(
            [
                ...nonEmptyStockSnapshots,
                ...emptyStockSnapshots
            ]
        );
    }

    async updateSectionStockItem(sectionId: string, itemUID: string, dto: UpdateLocationSectionStockDto): Promise<Either<Stock | StockSnapshot, NextResponse>> {
        const bodyValidated = this.updateStockItemDtoSchema.safeParse(dto);
        if (!bodyValidated.success)
            return new Either<Stock, NextResponse>(undefined, respondWithInit({
                message: "Invalid body!",
                validationErrors: bodyValidated,
                status: 400
            }));
        if (dto.quantity === undefined && dto.sellingPrice === undefined)
            return new Either<Stock, NextResponse>(undefined, respondWithInit({
                message: "You provided nothing to update!",
                status: 404
            }));
        return this.updateCurrentSectionStockSnapshot(sectionId, itemUID, dto);
    };

    private updateStockItemDtoSchema = z.object({
        sellingPrice: z.number(),
        quantity: z.number()
    }).partial().strict();

    async updateCurrentSectionStockSnapshot(
        sectionId: string,
        itemUID: string,
        dto: UpdateStockDto
    ): Promise<Either<StockSnapshot, NextResponse>> {
        const dtoValidated = updateCurrentStockSnapshotSchema.safeParse(dto);
        if (!dtoValidated.success)
            return new Either<StockSnapshot, NextResponse>(undefined, respondWithInit({
                message: "Invalid body!",
                validationErrors: dtoValidated,
                status: 400
            }));

        if (dto.quantity === undefined && !dto.name && dto.price === undefined && dto.type === undefined && dto.sellingPrice === undefined)
            return new Either<StockSnapshot, NextResponse>(undefined, respondWithInit({
                message: "You must provide some data to update!",
                status: 400
            }));

        const currentSnapshotMiddleman = await this.fetchCurrentSectionSnapshot(sectionId);
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
    }

    async fetchSectionStock(sectionId: string, stockUID: string): Promise<Either<Stock, NextResponse>> {
        const fetchedSectionMiddleman = await this.fetchInventorySection(sectionId, true);
        if (fetchedSectionMiddleman.error)
            return new Either<Stock, NextResponse>(undefined, fetchedSectionMiddleman.error);
        const fetchedSection = fetchedSectionMiddleman.success!;

        const item = fetchedSection.assignedStock?.find(item => item.uid === stockUID);
        if (!item)
            return new Either<Stock, NextResponse>(undefined, respondWithInit({
                message: `There was no stock item found in inventory section with id ${sectionId} with stock UID ${stockUID}`,
                status: 404
            }));
        return new Either<Stock, NextResponse>(item);
    }

    async fetchSectionStocks(sectionId: string, stockUIDs: string[]): Promise<Either<Stock[], NextResponse>> {
        const fetchedSectionMiddleman = await this.fetchInventorySection(sectionId, true);
        if (fetchedSectionMiddleman.error)
            return new Either<Stock[], NextResponse>(undefined, fetchedSectionMiddleman.error);
        const fetchedSection = fetchedSectionMiddleman.success!;

        const items = fetchedSection.assignedStock?.filter(item => stockUIDs.includes(item.uid));
        if (!items || !items.length)
            return new Either<Stock[], NextResponse>(undefined, respondWithInit({
                message: `There was no stock item found in inventory section with id ${sectionId} with stock any UID ${stockUIDs.toString()}`,
                status: 404
            }));
        return new Either<Stock[], NextResponse>(items);
    }

    async createSectionStock(sectionId: string, dto: AddLocationStockDto): Promise<Either<Stock, NextResponse>> {
        const fetchedSection = await this.fetchInventorySection(sectionId, true);
        if (fetchedSection.error)
            return new Either<Stock, NextResponse>(undefined, fetchedSection.error);
        const inventorySection = fetchedSection.success!;

        if (inventorySection.assignedStockIds.includes(dto.stockId))
            return new Either<Stock, NextResponse>(undefined, respondWithInit({
                message: "That item has already been added!",
                status: 400
            }));

        const fetchedStock = await prisma.stock.findUnique({
            where: {
                id: dto.stockId
            }
        });

        if (!fetchedStock)
            return new Either<Stock, NextResponse>(undefined, respondWithInit({
                message: `There is no stock with ID: ${dto.stockId}`,
                status: 404
            }));

        const updatedStock = await prisma.stock.update({
            where: {
                id: fetchedStock.id
            },
            data: {
                assignedInventorySectionIds: {
                    push: sectionId
                }
            }
        });

        const updatedSection = await prisma.inventorySection.update({
            where: {
                id: sectionId
            },
            data: {
                assignedStockIds: {
                    push: updatedStock.id
                }
            }
        });

        if (!updatedStock || !updatedSection)
            return new Either<Stock, NextResponse>(undefined, respondWithInit({
                message: "The stock item or inventory section wasn't updated somehow!",
                status: 500
            }));

        const createdSnapshot = await this.createSectionStockSnapshot(sectionId, {
            name: fetchedStock.name,
            type: fetchedStock.type,
            price: fetchedStock.price
        });
        if (createdSnapshot.error)
            return new Either<Stock, NextResponse>(undefined, createdSnapshot.error);
        return new Either<Stock, NextResponse>(updatedStock);
    }

    private async createSectionStockSnapshot(sectionId: string, dto: {
        name: string,
        type: StockType | null,
        price: number
    }): Promise<Either<StockSnapshot, NextResponse>> {
        const dtoValidated = this.createBarStockDtoSchema.safeParse(dto);
        if (!dtoValidated.success)
            return new Either<StockSnapshot, NextResponse>(undefined, respondWithInit({
                message: "Invalid body!",
                validationErrors: dtoValidated,
                status: 400
            }));

        const fetchedSnapshot = await this.fetchCurrentSectionSnapshot(sectionId);
        if (fetchedSnapshot.error)
            return new Either<StockSnapshot, NextResponse>(undefined, fetchedSnapshot.error);
        const currentSectionSnapshot = fetchedSnapshot.success!;

        const validatedItemName = inventoryService.generateValidStockName(dto.name);
        if (validatedItemName.error)
            return new Either<StockSnapshot, NextResponse>(undefined, validatedItemName.error);

        const validName = validatedItemName.success!;
        const originalStockItem = currentSectionSnapshot.inventorySection?.assignedStock?.find(stock => stock.name === validName);
        if (!originalStockItem)
            return new Either<StockSnapshot, NextResponse>(
                undefined,
                respond({
                    message: `Inventory section with id "${sectionId}" doesn't have any stock items called "${validName}"`,
                    init: {
                        status: 400
                    }
                })
            );

        const existingSnapshot = currentSectionSnapshot.stockSnapshots?.find(stockSnapshot => stockSnapshot.uid === originalStockItem.uid);
        if (existingSnapshot)
            return new Either<StockSnapshot, NextResponse>(existingSnapshot);

        const stockSnapshot = await prisma.stockSnapshot.create({
            data: {
                uid: originalStockItem.uid,
                name: originalStockItem.name,
                type: originalStockItem.type,
                price: originalStockItem.price,
                quantity: 0,
                inventorySectionSnapshotId: currentSectionSnapshot.id
            }
        });

        return new Either<StockSnapshot, NextResponse>(stockSnapshot);
    }

    private createBarStockDtoSchema = z.object({
        name: z.string(),
        type: z.string().optional(),
        price: z.number()
    }).strict();

    async deleteSectionStock(sectionId: string, stockUID: string): Promise<Either<Stock, NextResponse>> {
        const fetchedItemMiddleman = await this.fetchSectionStock(sectionId, stockUID);
        if (fetchedItemMiddleman.error)
            return fetchedItemMiddleman;
        const item = fetchedItemMiddleman.success!;

        const inventorySection = await prisma.inventorySection.findUnique({
            where: {
                id: sectionId
            },
            select: {
                assignedStockIds: true
            }
        });

        if (!inventorySection)
            return new Either<Stock, NextResponse>(undefined, respondWithInit({
                message: `There was no inventory section with the ID: ${sectionId}`,
                status: 404
            }));

        await prisma.stock.update({
            where: {
                uid: stockUID
            },
            data: {
                assignedInventorySectionIds: item.assignedInventorySectionIds.filter(id => id !== sectionId)
            }
        });

        await prisma.inventorySection.update({
            where: {
                id: sectionId
            },
            data: {
                assignedStockIds: inventorySection.assignedStockIds.filter(id => id !== item.id)
            }
        });

        // Delete from current snapshot
        const currentSnapshotMiddleman = await this.fetchCurrentSectionSnapshot(sectionId);
        if (currentSnapshotMiddleman.error)
            return new Either<Stock, NextResponse>(undefined, currentSnapshotMiddleman.error);
        const currentSnapshot = currentSnapshotMiddleman.success!;
        await prisma.stockSnapshot.deleteMany({
            where: {
                inventorySectionSnapshotId: currentSnapshot.id,
                uid: item.uid
            }
        });
        return new Either<Stock, NextResponse>(item);
    }

    async deleteSectionStocks(sectionId: string, stockUIDs: string[]): Promise<Either<Stock[], NextResponse>> {
        const fetchedItemMiddleman = await this.fetchSectionStocks(sectionId, stockUIDs);
        if (fetchedItemMiddleman.error)
            return fetchedItemMiddleman;
        const items = fetchedItemMiddleman.success!;
        const itemIds = items.map(item => item.id);

        const inventorySection = await prisma.inventorySection.findUnique({
            where: {
                id: sectionId
            },
            select: {
                assignedStockIds: true
            }
        });

        if (!inventorySection)
            return new Either<Stock[], NextResponse>(undefined, respondWithInit({
                message: `There was no inventory section with the ID: ${sectionId}`,
                status: 404
            }));

        // Remove all related stock ids from inventory sections
        await prisma.inventorySection.update({
            where: {
                id: sectionId
            },
            data: {
                assignedStockIds: inventorySection.assignedStockIds.filter(id => !itemIds.includes(id))
            }
        });

        // Remove all related inventory sections from stock
        await prisma.stock.findMany({
            where: {
                uid: {
                    in: stockUIDs
                }
            }
        }).then(stock => {
            return prisma.$transaction(
                stock.map(item => prisma.stock.update({
                    where: {
                        id: item.id
                    },
                    data: {
                        assignedInventorySectionIds: item.assignedInventorySectionIds.filter(id => id != sectionId)
                    }
                }))
            );
        });

        // Delete from current snapshot
        const currentSnapshotMiddleman = await this.fetchCurrentSectionSnapshot(sectionId);
        if (currentSnapshotMiddleman.error)
            return new Either<Stock[], NextResponse>(undefined, currentSnapshotMiddleman.error);
        const currentSnapshot = currentSnapshotMiddleman.success!;
        await prisma.stockSnapshot.deleteMany({
            where: {
                inventorySectionSnapshotId: currentSnapshot.id,
                uid: {
                    in: stockUIDs
                }
            }
        });
        return new Either<Stock[], NextResponse>(items);
    }

    async fetchSectionSnapshots(inventoryName: string, type: InventoryType = InventoryType.DEFAULT): Promise<Either<InventorySectionsSnapshot[], NextResponse>> {
        const sectionsMiddleMan = await this.fetchInventorySections(inventoryName, type);
        if (sectionsMiddleMan.error)
            return new Either<InventorySectionsSnapshot[], NextResponse>(undefined, sectionsMiddleMan.error);
        const sections = sectionsMiddleMan.success!;

        const groupedSections = await prisma.$transaction(
            sections.map(section => prisma.inventorySectionSnapshot.findMany({
                where: {
                    inventorySectionId: section.id
                },
                include: {
                    inventorySection: true
                }
            }))
        );

        const groupedDates = (await prisma.inventorySectionSnapshot.groupBy({
            by: ["createdAt"],
            where: {
                inventorySectionId: {
                    in: sections.map(section => section.id)
                }
            }
        })).map(date => {
            const dateObj = new Date(date.createdAt);
            dateObj.setHours(0, 0, 0, 0);
            return { createdAt: dateObj };
        });

        const snapshots = groupedDates.map<InventorySectionsSnapshot>(date => {
            const dateObj = new Date(date.createdAt);
            const correspondingSectionSnapshots = groupedSections
                .map(sectionArr => sectionArr.find(section => {
                    const endOfDay = new Date(section.createdAt);
                    endOfDay.setHours(23, 59, 59, 999);

                    const sectionDate = new Date(section.createdAt);
                    return sectionDate >= dateObj && sectionDate <= endOfDay;
                })!)
                .filter((snapshot) => !!snapshot);

            return {
                createdAt: dateObj,
                data: correspondingSectionSnapshots
            };
        });

        return new Either<InventorySectionsSnapshot[], NextResponse>(snapshots);
    }

    async fetchSnapshot(inventoryName: string, date: number, type: InventoryType = InventoryType.DEFAULT): Promise<Either<InventorySectionsSnapshot, NextResponse>> {
        const dateObj = new Date(date);
        dateObj.setHours(0, 0, 0, 0);
        const endOfDayObj = new Date(date);
        endOfDayObj.setHours(23, 59, 59, 999);

        const sectionsMiddleMan = await this.fetchInventorySections(inventoryName, type);
        if (sectionsMiddleMan.error)
            return new Either<InventorySectionsSnapshot, NextResponse>(undefined, sectionsMiddleMan.error);
        const sections = sectionsMiddleMan.success!;

        const groupedSections = await prisma.$transaction(
            sections.map(section => prisma.inventorySectionSnapshot.findMany({
                where: {
                    inventorySectionId: section.id,
                    createdAt: {
                        gte: dateObj,
                        lte: endOfDayObj
                    }
                },
                include: {
                    inventorySection: true,
                    stockSnapshots: true
                }
            }))
        );

        const correspondingSectionSnapshots = groupedSections
            .map(sectionArr => sectionArr.find(section => {
                const sectionDate = new Date(section.createdAt);
                return sectionDate >= dateObj && sectionDate <= endOfDayObj;
            })!)
            .filter((snapshot) => !!snapshot);

        return new Either<InventorySectionsSnapshot, NextResponse>({
            createdAt: dateObj,
            data: correspondingSectionSnapshots
        });
    }

    private async handlePrismaErrors<T>(logic: () => Promise<Either<T, NextResponse>>, { notFound }: {
        notFound?: string
    }): Promise<Either<T, NextResponse>> {
        try {
            return logic();
        } catch (e) {
            if (e instanceof PrismaClientKnownRequestError) {
                switch (e.code) {
                    case "P2025": {
                        return new Either<T, NextResponse>(undefined, respondWithInit({
                            message: notFound ?? "Nothing was found!",
                            status: 404
                        }));
                    }
                }
            }

            throw e;
        }
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