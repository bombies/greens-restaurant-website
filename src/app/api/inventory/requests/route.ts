import { authenticatedAny } from "../../../../utils/api/ApiUtils";
import Permission from "../../../../libs/types/permission";
import prisma from "../../../../libs/prisma";
import { NextResponse } from "next/server";
import { Prisma } from ".prisma/client";
import StockRequestWhereInput = Prisma.StockRequestWhereInput;
import selfUserService from "./me/service";

export async function GET(req: Request) {
    return authenticatedAny(req, async () => {
        const {
            status,
            withUsers,
            withItems,
            withAssignees,
            from, to,
            withStock,
            withReviewer,
            withLocation
        } = selfUserService.getFetchStockRequestsSearchParams(req.url);
        let whereQuery: StockRequestWhereInput = {};

        if (status)
            whereQuery = {
                status
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
            }
        });
        return NextResponse.json(requests);
    }, [Permission.VIEW_STOCK_REQUESTS, Permission.MANAGE_STOCK_REQUESTS, Permission.CREATE_INVENTORY]);
}