import inventoryService, { Either } from "../[name]/service";
import { Prisma, RequestedStockItem } from "@prisma/client";
import { NextResponse } from "next/server";
import prisma from "../../../../libs/prisma";
import RequestedStockItemWhereInput = Prisma.RequestedStockItemWhereInput;
import {
    AdminUpdateStockRequestDto, adminUpdateStockRequestDtoSchema, CreateStockRequestDto, createStockRequestSchemaDto,
    InventoryWithRequestedStockItems,
    RequestStockItemWithStockAndOptionalInventory, ReviewInventoryRequestDto, reviewInventoryRequestDtoSchema,
    StockRequestWithOptionalExtras
} from "./types";
import { ErrorResponse, respondWithInit } from "../../../../utils/api/ApiUtils";
import { InventoryType, StockRequestStatus } from ".prisma/client";
import { arrayCompare } from "../../../../utils/GeneralUtils";
import Permission, { hasAnyPermission } from "../../../../libs/types/permission";
import StockRequestWhereInput = Prisma.StockRequestWhereInput;
import { Mailer } from "../../../../utils/api/mail/Mailer";
import { Session } from "next-auth";
import { PaginatedResponse, buildResponse } from "../../utils/utils";

type FetchStockRequestSearchParams = {
    status: StockRequestStatus[],
    withItems: boolean,
    withUsers: boolean,
    withAssignees: boolean,
    withReviewer: boolean,
    withLocation: boolean,
    withStock: boolean,
    from?: number,
    to?: number,
    sort?: "asc" | "desc",

    // Pagination
    cursor?: string
    limit?: number
}

type FetchRequestsArgs = Partial<{
    userId: string,
    userPermissions: number
    strictySelf: boolean
} & FetchStockRequestSearchParams>

class InventoryRequestsService {

    async fetchRequestedItems({ stockIds, from, to, locationName }: {
        stockIds: string[],
        from?: number,
        to?: number,
        locationName?: string,
    }): Promise<Either<RequestedStockItem[], NextResponse>> {
        let whereQuery: RequestedStockItemWhereInput = {
            stockId: stockIds.length ? {
                in: stockIds
            } : undefined
        };

        if (locationName) {
            const locationFetchResult = await inventoryService.fetchInventory(locationName, {
                location: true
            });

            if (locationFetchResult.error)
                return new Either<RequestedStockItem[], NextResponse>(undefined, locationFetchResult.error);

            whereQuery = {
                ...whereQuery,
                stockRequest: {
                    assignedLocationId: locationFetchResult.success!.id
                }
            };

        }

        if (from)
            whereQuery = {
                ...whereQuery,
                createdAt: {
                    gte: new Date(from)
                }
            };

        if (to)
            whereQuery = {
                ...whereQuery,
                createdAt: whereQuery.createdAt
                    && typeof whereQuery.createdAt !== "string"
                    && "gte" in whereQuery.createdAt ?
                    {
                        ...whereQuery.createdAt,
                        lte: new Date(to)
                    } : {
                        lte: new Date(to)
                    }
            };

        const items = await prisma.requestedStockItem.findMany({
            where: whereQuery
        });

        return new Either<RequestedStockItem[], NextResponse>(items);
    }

    public fetchRequest = async (requestId: string, userId: string, userPermissions: number, {
        withUsers,
        withAssignees,
        withItems,
        withReviewer = false
    }: {
        withItems: boolean,
        withUsers: boolean,
        withAssignees: boolean,
        withReviewer: boolean
    }): Promise<StockRequestWithOptionalExtras | null> => {
        const andArr: any[] = [{ id: requestId }];
        if (!hasAnyPermission(userPermissions, [
            Permission.CREATE_INVENTORY,
            Permission.VIEW_STOCK_REQUESTS,
            Permission.MANAGE_STOCK_REQUESTS
        ]))
            andArr.push({ requestedByUserId: userId });

        return prisma.stockRequest.findFirst({
            where: {
                AND: andArr
            },
            include: {
                requestedItems: withItems && {
                    include: {
                        stock: {
                            include: {
                                inventory: true
                            }
                        }
                    }
                },
                assignedLocation: true,
                reviewedByUser: withReviewer,
                requestedByUser: withUsers,
                assignedToUsers: withAssignees
            }
        }) as any;
    };

    getFetchStockRequestsSearchParams(url: string): FetchStockRequestSearchParams {
        const { searchParams } = new URL(url);

        const status = searchParams.get("status")?.toUpperCase();
        const statusArray: StockRequestStatus[] = status?.split(",").map(status => status as StockRequestStatus) ?? []

        const withItems = searchParams.get("with_items")?.toLowerCase() === "true" || false;
        const withUsers = searchParams.get("with_users")?.toLowerCase() === "true" || false;
        const withStock = searchParams.get("with_stock")?.toLowerCase() === "true" || false;
        const withReviewer = searchParams.get("with_reviewer")?.toLowerCase() === "true" || false;
        const withAssignees = searchParams.get("with_assignees")?.toLowerCase() === "true" || false;
        const withLocation = searchParams.get("with_location")?.toLowerCase() === "true" || false;

        const from: number | undefined = searchParams.get("from") ? Number(searchParams.get("from")) : undefined;
        const to: number | undefined = searchParams.get("to") ? Number(searchParams.get("to")) : undefined;

        let sort = searchParams.get("sort") ?? undefined;
        if (sort && sort !== "asc" && sort !== "desc")
            sort = undefined

        /**
         * Pagination
         */
        const cursor = searchParams.get("cursor") || undefined;
        const limit = searchParams.get("limit") ? Number(searchParams.get("limit")) : undefined;

        return {
            status: statusArray,
            withItems,
            withUsers,
            withAssignees,
            from,
            to,
            withStock,
            withReviewer,
            withLocation,
            sort: sort as "asc" | "desc" | undefined,
            cursor,
            limit
        };
    };

    public fetchRequests = async ({
        userId,
        userPermissions,
        withUsers,
        withAssignees,
        withItems,
        status,
        from,
        to,
        withStock,
        withLocation,
        withReviewer,
        strictySelf = false,
        sort,
        cursor,
        limit
    }: FetchRequestsArgs): Promise<PaginatedResponse<StockRequestWithOptionalExtras> | StockRequestWithOptionalExtras[]> => {
        let whereQuery: StockRequestWhereInput = {};

        if ((strictySelf || !hasAnyPermission(userPermissions, [
            Permission.CREATE_INVENTORY,
            Permission.VIEW_STOCK_REQUESTS,
            Permission.MANAGE_STOCK_REQUESTS
        ])) && userId)
            whereQuery = { requestedByUserId: userId };

        if (status?.length)
            whereQuery = {
                ...whereQuery,
                status: {
                    in: status
                }
            };

        if (from && to) {
            whereQuery = {
                ...whereQuery,
                OR: [
                    {
                        deliveredAt: { isSet: false },
                        createdAt: {
                            gte: new Date(from),
                            lte: new Date(to)
                        }
                    },
                    {
                        deliveredAt: {
                            gte: new Date(from),
                            lte: new Date(to)
                        }
                    }
                ]
            };
        } else {
            if (from)
                whereQuery = {
                    ...whereQuery,
                    OR: [
                        {
                            deliveredAt: { isSet: false },
                            createdAt: {
                                gte: new Date(from)
                            }
                        },
                        {
                            deliveredAt: {
                                gte: new Date(from)
                            }
                        }
                    ]
                };

            if (to)
                whereQuery = {
                    ...whereQuery,
                    OR: [
                        {
                            deliveredAt: { isSet: false },
                            createdAt: {
                                lte: new Date(to)
                            }
                        },
                        {
                            deliveredAt: {
                                lte: new Date(to)
                            }
                        }
                    ]
                };
        }

        const requests = await prisma.stockRequest.findMany({
            cursor: cursor && cursor.length ? {
                id: cursor,
            } : undefined,
            take: limit ? limit + 1 : undefined,
            skip: cursor && cursor.length ? 1 : 0,
            where: whereQuery,
            include: {
                requestedItems: withItems && (withStock ? {
                    include: {
                        stock: true
                    }
                } : true),
                assignedLocation: withLocation,
                requestedByUser: withUsers,
                assignedToUsers: withAssignees,
                reviewedByUser: withReviewer
            },
            orderBy: [
                {
                    deliveredAt: sort
                },
                {
                    createdAt: sort
                }
            ]
        })

        let nextCursor: StockRequestWithOptionalExtras | undefined;
        if (limit && requests.length > limit)
            nextCursor = requests.pop();

        return !limit ? requests : ({
            data: requests,
            nextCursor: nextCursor?.id ?? null
        });
    };

    public createRequest = async (userId: string, dto: CreateStockRequestDto): Promise<Either<StockRequestWithOptionalExtras, NextResponse<ErrorResponse>>> => {
        const bodyValidated = createStockRequestSchemaDto.safeParse(dto);
        if (!dto || !bodyValidated)
            return new Either<StockRequestWithOptionalExtras, NextResponse<ErrorResponse>>(undefined, respondWithInit({
                message: "Invalid payload!",
                validationErrors: bodyValidated,
                status: 400
            }));

        const validStockIds = (await prisma.stock.findMany({
            where: {
                id: {
                    in: dto.items.map(item => item.stockId)
                }
            },
            select: { id: true }
        })).map(item => item.id);

        const location = await prisma.inventory.findUnique({
            where: {
                id: dto.assignedLocationId,
                type: InventoryType.LOCATION
            }
        });

        if (!location)
            return new Either<StockRequestWithOptionalExtras, NextResponse<ErrorResponse>>(undefined, respondWithInit({
                message: `There is no location with the ID: ${dto.assignedLocationId}`
            }));

        const createdRequest = await prisma.stockRequest.create({
            data: {
                status: StockRequestStatus.PENDING,
                requestedByUserId: userId,
                assignedToUsersId: dto.assignedToUsersId,
                assignedLocationId: dto.assignedLocationId
            },
            include: {
                requestedByUser: true,
                assignedToUsers: true
            }
        });

        const itemsToBeCreated = dto.items
            .filter(item => validStockIds.includes(item.stockId))
            .map(item => ({ ...item, stockRequestId: createdRequest.id }));

        const createdRequestedStockItems = await prisma.requestedStockItem.createMany({
            data: itemsToBeCreated
        }).then(() => prisma.requestedStockItem.findMany({
            where: {
                stockRequestId: createdRequest.id
            },
            include: {
                stock: true
            }
        }));

        await prisma.user.updateMany({
            where: {
                id: { in: dto.assignedToUsersId }
            },
            data: {
                assignedStockRequestsIds: {
                    push: createdRequest.id
                }
            }
        });

        await Mailer.sendInventoryRequestAssignment({
            assignees: createdRequest.assignedToUsers,
            request: { ...createdRequest, requestedItems: createdRequestedStockItems }
        });

        return new Either<StockRequestWithOptionalExtras, NextResponse<ErrorResponse>>({
            ...createdRequest,
            requestedItems: createdRequestedStockItems
        });
    };

    public adminUpdateRequest = async (requestId: string, dto: AdminUpdateStockRequestDto): Promise<Either<StockRequestWithOptionalExtras, NextResponse<ErrorResponse>>> => {
        const bodyValidated = adminUpdateStockRequestDtoSchema.safeParse(dto);
        if (!dto || !bodyValidated.success)
            return new Either<StockRequestWithOptionalExtras, NextResponse<ErrorResponse>>(undefined, respondWithInit({
                message: "Invalid body!",
                validationErrors: bodyValidated,
                status: 400
            }));

        const request = await prisma.stockRequest.findUnique({
            where: {
                id: requestId
            }
        });

        if (!request)
            return new Either<StockRequestWithOptionalExtras, NextResponse<ErrorResponse>>(undefined, respondWithInit({
                message: `There was no request with the ID ${requestId}`,
                status: 400
            }));

        const updatedRequest = await prisma.stockRequest.update({
            where: {
                id: requestId
            },
            data: dto
        });

        return new Either<StockRequestWithOptionalExtras, NextResponse<ErrorResponse>>(updatedRequest as any);
    };

    public review = async (session: Session, requestId: string, dto: ReviewInventoryRequestDto): Promise<Either<StockRequestWithOptionalExtras, NextResponse<ErrorResponse>>> => {
        const bodyValidated = reviewInventoryRequestDtoSchema.safeParse(dto);
        if (!bodyValidated.success)
            return new Either<StockRequestWithOptionalExtras, NextResponse<ErrorResponse>>(undefined, respondWithInit({
                message: "Invalid payload!",
                validationErrors: bodyValidated,
                status: 400
            }));

        /**
         * Generate the status of the request.
         * The status is initialized a delivered,
         * just being optimistic.
         */
        let status: StockRequestStatus = StockRequestStatus.DELIVERED;

        // Check if no stock were delivered.
        // If such was the case, the request was rejected.
        if (!dto.items.reduce((prev, cur) => prev + cur.amountProvided, 0))
            status = StockRequestStatus.REJECTED;

        // If the status isn't rejected, check if there were any
        // items that weren't provided. If any are found, the request
        // is partially-delivered.
        if (status !== StockRequestStatus.REJECTED && dto.items.find(item => item.amountProvided < item.amountRequested))
            status = StockRequestStatus.PARTIALLY_DELIVERED;

        // If the status is still delivered, check
        // to ensure all the items provided are all
        // the items that are attached to the stock request.
        // If all the items aren't provided, the status will
        // be set to partially-delivered.
        if (status === StockRequestStatus.DELIVERED) {
            const stockRequestIds = (await prisma.stockRequest.findUnique({
                where: { id: requestId },
                select: { requestedItems: true }
            }))?.requestedItems.map(item => item.id);

            if (!stockRequestIds)
                return new Either<StockRequestWithOptionalExtras, NextResponse<ErrorResponse>>(undefined, respondWithInit({
                    message: `There is no stock request with id: ${requestId}`,
                    status: 404
                }));

            const dtoItemIds = dto.items.map(item => item.id);
            if (!arrayCompare(dtoItemIds, stockRequestIds))
                status = StockRequestStatus.PARTIALLY_DELIVERED;
        }

        /**
         * Update the respective stock items
         */
        const items = await prisma.$transaction(
            dto.items.map(item => prisma.requestedStockItem.update({
                where: { id: item.id },
                data: { amountProvided: item.amountProvided },
                include: {
                    stock: {
                        include: {
                            inventory: true
                        }
                    }
                }
            }))
        );

        /**
         * Update the stock request with the new status
         */
        const request = await prisma.stockRequest.update({
            where: { id: requestId },
            data: {
                status,
                reviewedNotes: dto.reviewedNotes,
                reviewedByUserId: session.user?.id,
                deliveredAt: new Date(dto.deliveredAt)
            },
        });

        /**
         * Update stock snapshots for the approved stock requests.
         */
        const approvedItems = items.filter(item => item.amountProvided);
        await this.updateSnapshots(approvedItems);
        return new Either<StockRequestWithOptionalExtras, NextResponse<ErrorResponse>>({
            ...request,
            requestedItems: items as any
        });
    };

    private updateSnapshots = async (items: RequestStockItemWithStockAndOptionalInventory[]): Promise<Either<Prisma.BatchPayload[], NextResponse>> => {
        const transformedItems = this.transformItems(items);
        const snapshots = await inventoryService.fetchCurrentSnapshots(transformedItems.map(item => item.inventory.id));
        if (snapshots.error)
            return new Either<Prisma.BatchPayload[], NextResponse>(undefined, snapshots.error);
        const fetchedSnapshots = snapshots.success!;
        const snapshotIds = fetchedSnapshots.map(snapshot => snapshot.id);

        const todaysDate = new Date();
        todaysDate.setHours(0, 0, 0, 0);
        const transactions = await prisma.$transaction(
            transformedItems.map(item =>
                item.items.map(requestedItem =>
                    prisma.stockSnapshot.updateMany({
                        where: {
                            uid: requestedItem.stock.uid,
                            createdAt: {
                                gte: todaysDate
                            },
                            inventorySnapshot: {
                                id: {
                                    in: snapshotIds
                                }
                            }
                        },
                        data: {
                            quantity: {
                                decrement: requestedItem.amountProvided ?? 0
                            }
                        }
                    })
                )
            ).flat()
        );

        return new Either<Prisma.BatchPayload[], NextResponse>(transactions);
    };

    private transformItems = (items: RequestStockItemWithStockAndOptionalInventory[]): InventoryWithRequestedStockItems[] => {
        const ret: InventoryWithRequestedStockItems[] = [];
        const hasInventory = (id: string) => {
            return !!ret.filter(obj => obj.inventory.id === id).length;
        };

        items.forEach(item => {
            const { stock, ...soleItem } = item;
            const { inventory, ...stockWithoutInventory } = stock;
            if (!inventory)
                return;
            if (hasInventory(inventory.id)) {
                const index = ret.findIndex(inv => inv.inventory.id === inventory.id);
                ret[index] = {
                    ...ret[index],
                    items: [
                        ...ret[index].items,
                        {
                            ...soleItem,
                            stock: stockWithoutInventory
                        }
                    ]
                };
            } else {
                ret.push({
                    inventory,
                    items: [{
                        ...soleItem,
                        stock: stockWithoutInventory
                    }]
                });
            }
        });
        return ret;
    };
}

const inventoryRequestsService = new InventoryRequestsService();
export default inventoryRequestsService;