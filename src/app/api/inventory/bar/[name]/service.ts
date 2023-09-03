import {
    Either,
    fetchInventory, generateValidStockName, updateCurrentStockSnapshotSchema
} from "../../[name]/utils";
import { InventorySection, Prisma, Stock, StockSnapshot, StockType } from "@prisma/client";
import { NextResponse } from "next/server";
import { respond, respondWithInit } from "../../../../../utils/api/ApiUtils";
import prisma from "../../../../../libs/prisma";
import { InventoryType } from ".prisma/client";
import { v4 } from "uuid";
import {
    CreateBarSectionStockItem,
    CreateInventorySectionDto,
    createInventorySectionDtoSchema, InventorySectionSnapshotWithOptionalExtras,
    InventorySectionWithOptionalExtras, UpdateInventorySectionDto, updateInventorySectionDtoSchema
} from "./types";
import PrismaClientKnownRequestError = Prisma.PrismaClientKnownRequestError;
import { INVENTORY_NAME_REGEX } from "../../../../../utils/regex";
import { z } from "zod";
import { CreateBarStockDto } from "./[sectionId]/stock/route";
import { UpdateBarSectionStockDto } from "./[sectionId]/stock/[stockUID]/route";
import { UpdateStockDto } from "../../[name]/stock/[id]/route";
import StockSnapshotCreateManyInput = Prisma.StockSnapshotCreateManyInput;

class BarService {

    public async fetchInventorySections(inventoryName: string): Promise<Either<InventorySectionWithOptionalExtras[], NextResponse>> {
        const inventoryMiddleman = await fetchInventory(inventoryName, { bar: true, inventorySections: true });
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
                stock: withStock
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

        const inventoryMiddleman = await fetchInventory(inventoryName, { bar: true });
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
                stock: true
            }
        });

        if (!inventorySection)
            return new Either<InventorySectionSnapshotWithOptionalExtras, NextResponse>(undefined, respondWithInit({
                message: `There was so inventory section found with the id: ${sectionId}`,
                status: 404
            }));

        const todaysDate = new Date();
        todaysDate.setHours(0, 0, 0, 0);
        const tommorowsDate = new Date();
        tommorowsDate.setHours(24, 0, 0, 0);

        const snapshot = await prisma.inventorySectionSnapshot.findFirst({
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
                        inventory: true
                    }
                }
            }
        });

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

    private updateStockItemDtoSchema = z.object({
        name: z.string(),
        quantity: z.number(),
        price: z.number(),
        type: z.string()
    }).partial().strict();

    async updateSectionStockItem(sectionId: string, itemUID: string, dto: UpdateBarSectionStockDto): Promise<Either<Stock | StockSnapshot, NextResponse>> {
        const bodyValidated = this.updateStockItemDtoSchema.safeParse(dto);
        if (!bodyValidated.success)
            return new Either<Stock, NextResponse>(undefined, respondWithInit({
                message: "Invalid body!",
                validationErrors: bodyValidated,
                status: 400
            }));

        const fetchedItem = await this.fetchSectionStock(sectionId, itemUID);
        if (fetchedItem.error)
            return new Either<Stock | StockSnapshot, NextResponse>(undefined, fetchedItem.error);

        const item = fetchedItem.success!;

        if (dto.name) {
            const validatedName = generateValidStockName(dto.name);
            if (validatedName.error)
                return new Either<Stock | StockSnapshot, NextResponse>(undefined, validatedName.error);
            dto.name = validatedName.success!;
        }


        const updatedStock = await prisma.stock.update({
            where: {
                id: item.id
            },
            data: {
                name: dto.name,
                type: dto.type,
                price: dto.price
            }
        });

        if (dto.quantity !== undefined || dto.price !== undefined || dto.name || dto.type)
            return this.updateCurrentSectionStockSnapshot(sectionId, itemUID, dto);
        return new Either<Stock, NextResponse>(updatedStock);
    };

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

        if (dto.quantity === undefined && !dto.name && dto.price === undefined)
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

        const item = fetchedSection.stock?.find(item => item.uid === stockUID);
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

        const items = fetchedSection.stock?.filter(item => stockUIDs.includes(item.uid));
        if (!items || !items.length)
            return new Either<Stock[], NextResponse>(undefined, respondWithInit({
                message: `There was no stock item found in inventory section with id ${sectionId} with stock any UID ${stockUIDs.toString()}`,
                status: 404
            }));
        return new Either<Stock[], NextResponse>(items);
    }

    async createSectionStock(sectionId: string, dto: CreateBarSectionStockItem): Promise<Either<Stock, NextResponse>> {
        const fetchedSection = await this.fetchInventorySection(sectionId, true);
        if (fetchedSection.error)
            return new Either<Stock, NextResponse>(undefined, fetchedSection.error);
        const inventorySection = fetchedSection.success!;

        if (!INVENTORY_NAME_REGEX.test(dto.name))
            return new Either<Stock, NextResponse>(undefined, respond({
                message: "Invalid item name! " +
                    "The item name must not be more than 30 characters. " +
                    "It should also not include any special characters. " +
                    "The item name must also start with a letter.",
                init: {
                    status: 400
                }
            }));

        const validName = dto.name
            .toLowerCase()
            .trim()
            .replaceAll(/\s{2,}/g, " ")
            .replaceAll(/\s/g, "-");

        if (inventorySection.stock?.find(item => item.name === validName))
            return new Either<Stock, NextResponse>(undefined, respond({
                message: "There is already an item with that name in this inventory!",
                init: {
                    status: 400
                }
            }));

        const createdStock = await prisma.stock.create({
            data: {
                name: validName,
                inventorySectionId: inventorySection.id,
                uid: v4(),
                type: "type" in dto ? dto.type : StockType.DEFAULT,
                price: dto.price
            }
        });

        const createdStockSnapshot = await this.createStockSnapshot(sectionId, {
            name: validName,
            type: "type" in dto ? dto.type : StockType.DEFAULT,
            price: dto.price
        });

        if (createdStockSnapshot.error)
            return new Either<Stock, NextResponse>(undefined, createdStockSnapshot.error);
        return new Either<Stock, NextResponse>(createdStock);
    }

    private createBarStockDtoSchema = z.object({
        name: z.string(),
        type: z.string().optional(),
        price: z.number()
    }).strict();

    private async createStockSnapshot(sectionId: string, dto: CreateBarStockDto): Promise<Either<StockSnapshot, NextResponse>> {
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

        const validatedItemName = generateValidStockName(dto.name);
        if (validatedItemName.error)
            return new Either<StockSnapshot, NextResponse>(undefined, validatedItemName.error);

        const validName = validatedItemName.success!;
        const originalStockItem = currentSectionSnapshot.inventorySection?.stock?.find(stock => stock.name === validName);
        if (!originalStockItem)
            return new Either<StockSnapshot, NextResponse>(
                undefined,
                respond({
                    message: `Inventory sections with id "${sectionId}" doesn't have any stock items called "${validName}"`,
                    init: {
                        status: 400
                    }
                })
            );

        if (currentSectionSnapshot.stockSnapshots?.filter(stockSnapshot => stockSnapshot.stock?.name === validName).length)
            return new Either<StockSnapshot, NextResponse>(
                undefined,
                respond({
                    message: "There is already an item with this name in the snapshot!",
                    init: {
                        status: 400
                    }
                })
            );

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

    async deleteSectionStock(sectionId: string, stockUID: string): Promise<Either<Stock, NextResponse>> {
        const fetchedItemMiddleman = await this.fetchSectionStock(sectionId, stockUID);
        if (fetchedItemMiddleman.error)
            return fetchedItemMiddleman;
        const item = fetchedItemMiddleman.success!;
        const deletedItem = await prisma.stock.delete({
            where: {
                uid: item.uid
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
        return new Either<Stock, NextResponse>(deletedItem);
    }

    async deleteSectionStocks(sectionId: string, stockUIDs: string[]): Promise<Either<Stock[], NextResponse>> {
        const fetchedItemMiddleman = await this.fetchSectionStocks(sectionId, stockUIDs);
        if (fetchedItemMiddleman.error)
            return fetchedItemMiddleman;
        const items = fetchedItemMiddleman.success!;
        await prisma.stock.deleteMany({
            where: {
                uid: {
                    in: stockUIDs
                }
            }
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