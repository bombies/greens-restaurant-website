import { authenticatedAny } from "../../../../utils/api/ApiUtils";
import Permission from "../../../../libs/types/permission";
import prisma from "../../../../libs/prisma";
import { NextResponse } from "next/server";
import { getFetchStockRequestsSearchParams } from "./me/route";
import { Prisma } from ".prisma/client";
import StockRequestWhereInput = Prisma.StockRequestWhereInput;

export async function GET(req: Request) {
    return authenticatedAny(req, async () => {
        const {
            status,
            withUsers,
            withItems,
            withAssignees,
            from, to
        } = getFetchStockRequestsSearchParams(req.url);
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
                requestedItems: withItems,
                requestedByUser: withUsers,
                assignedToUsers: withAssignees
            }
        });
        return NextResponse.json(requests);
    }, [Permission.VIEW_STOCK_REQUESTS, Permission.MANAGE_STOCK_REQUESTS, Permission.CREATE_INVENTORY]);
}