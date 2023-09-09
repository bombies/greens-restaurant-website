import inventoryService, { Either } from "../../[name]/service";
import { InventorySection, Prisma, Stock, StockSnapshot, StockType } from "@prisma/client";
import { NextResponse } from "next/server";
import { respond, respondWithInit } from "../../../../../utils/api/ApiUtils";
import prisma from "../../../../../libs/prisma";
import { InventoryType } from ".prisma/client";
import { v4 } from "uuid";
import {
    BarSnapshot,
    CreateInventorySectionDto,
    createInventorySectionDtoSchema,
    InventorySectionSnapshotWithOptionalExtras,
    InventorySectionWithOptionalExtras,
    UpdateInventorySectionDto,
    updateInventorySectionDtoSchema
} from "./types";
import { z } from "zod";
import { AddBarStockDto } from "./[sectionId]/stock/route";
import { UpdateBarSectionStockDto } from "./[sectionId]/stock/[stockUID]/route";
import { UpdateStockDto } from "../../[name]/stock/[id]/route";
import { updateCurrentStockSnapshotSchema } from "../../[name]/types";
import PrismaClientKnownRequestError = Prisma.PrismaClientKnownRequestError;
import StockSnapshotCreateManyInput = Prisma.StockSnapshotCreateManyInput;
import "../../../../../utils/GeneralUtils";

class BarService {

    public async fetchInventorySections(inventoryName: string): Promise<Either<InventorySectionWithOptionalExtras[], NextResponse>> {
        const inventoryMiddleman = await inventoryService.fetchInventory(inventoryName, {
            bar: true,
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

    public async createInventorySection(inventoryName: string, dto: CreateInventorySectionDto): Promise<Either<InventorySectionWithOptionalExtras, NextResponse>> {
        const dtoValidated = createInventorySectionDtoSchema.safeParse(dto);
        if (!dtoValidated.success)
            return new Either<InventorySection, NextResponse>(undefined, respondWithInit({
                message: "Invalid body!",
                validationErrors: dtoValidated,
                status: 400
            }));

        const inventoryMiddleman = await inventoryService.fetchInventory(inventoryName, { bar: true });
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
                    type: InventoryType.BAR
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

    public async fetchCurrentSectionSnapshots(sectionIds?: string[]): Promise<Either<InventorySectionSnapshotWithOptionalExtras[], NextResponse>> {
        const inventorySections = await prisma.inventorySection.findMany({
            where: {
                id: sectionIds && {
                    in: sectionIds
                }
            },
            include: {
                stock: true
            }
        });

        if (!inventorySections || !inventorySections.length)
            return new Either<InventorySectionSnapshotWithOptionalExtras[], NextResponse>(undefined, respondWithInit({
                message: `There was so inventory sections found with the ids: ${sectionIds}`,
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

    async fetchMostRecentSnapshots({ sectionIds, inventoryName }: {
        sectionIds?: string[],
        inventoryName?: string
    }): Promise<Either<InventorySectionSnapshotWithOptionalExtras[], NextResponse>> {
        let validInventoryName = inventoryService.generateValidInventoryName(inventoryName ?? "");
        if (inventoryName && validInventoryName.error)
            return new Either<InventorySectionSnapshotWithOptionalExtras[], NextResponse>(undefined, validInventoryName.error);

        const inventorySections = await prisma.inventorySection.findMany({
            where: {
                id: sectionIds ? {
                    in: sectionIds
                } : undefined,
                inventory: inventoryName ? {
                    name: validInventoryName.success
                } : undefined
            },
            include: {
                stock: true
            }
        });

        if (!inventorySections || !inventorySections.length)
            return new Either<InventorySectionSnapshotWithOptionalExtras[], NextResponse>(undefined, respondWithInit({
                message: `There was so inventory section found with the ids: ${sectionIds}`,
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

    async updateSectionStockItem(sectionId: string, itemUID: string, dto: UpdateBarSectionStockDto): Promise<Either<Stock | StockSnapshot, NextResponse>> {
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

    async createSectionStock(sectionId: string, dto: AddBarStockDto): Promise<Either<Stock, NextResponse>> {
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

        const createdSnapshot = await this.createStockSnapshot(sectionId, {
            name: fetchedStock.name,
            type: fetchedStock.type,
            price: fetchedStock.price
        });
        if (createdSnapshot.error)
            return new Either<Stock, NextResponse>(undefined, createdSnapshot.error);
        return new Either<Stock, NextResponse>(updatedStock);
    }

    private async createStockSnapshot(sectionId: string, dto: {
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

    async fetchSnapshots(inventoryName: string): Promise<Either<BarSnapshot[], NextResponse>> {
        const sectionsMiddleMan = await this.fetchInventorySections(inventoryName);
        if (sectionsMiddleMan.error)
            return new Either<BarSnapshot[], NextResponse>(undefined, sectionsMiddleMan.error);
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

        const snapshots = groupedDates.map<BarSnapshot>(date => {
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

        return new Either<BarSnapshot[], NextResponse>(snapshots);
    }

    async fetchSnapshot(inventoryName: string, date: number): Promise<Either<BarSnapshot, NextResponse>> {
        const dateObj = new Date(date);
        dateObj.setHours(0, 0, 0, 0);
        const endOfDayObj = new Date(date);
        endOfDayObj.setHours(23, 59, 59, 999);

        const sectionsMiddleMan = await this.fetchInventorySections(inventoryName);
        if (sectionsMiddleMan.error)
            return new Either<BarSnapshot, NextResponse>(undefined, sectionsMiddleMan.error);
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

        return new Either<BarSnapshot, NextResponse>({
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
}

const barService = new BarService();
export default barService;