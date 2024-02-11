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
        } = selfUserService.getFetchStockRequestsSearchParams(req.url);
        let whereQuery: StockRequestWhereInput = {};

        if (status)
            whereQuery = {
                status
            };

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
                createdAt: whereQuery.createdAt && typeof whereQuery.createdAt !== "string" && "gte" in whereQuery.createdAt ? {
                    ...whereQuery.createdAt,
                    lte: new Date(to)
                } : {
                    lte: new Date(to)
                }
            };

        const requests = await prisma.stockRequest.findMany({
            where: whereQuery,
            include: {
                requestedItems: withItems && (withStock ? {
                    include: {
                        stock: true
                    }
                } : true),
                assignedLocation: true,
                requestedByUser: withUsers,
                assignedToUsers: withAssignees,
                reviewedByUser: withReviewer
            }
        });
        return NextResponse.json(requests);
    }, [Permission.VIEW_STOCK_REQUESTS, Permission.MANAGE_STOCK_REQUESTS, Permission.CREATE_INVENTORY]);
}