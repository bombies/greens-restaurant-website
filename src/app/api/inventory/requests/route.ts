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
            rejected,
            reviewed,
            withUsers,
            withItems,
            withAssignees
        } = getFetchStockRequestsSearchParams(req.url);
        let whereQuery: StockRequestWhereInput = {};

        if (rejected)
            whereQuery = {
                rejected
            };

        if (reviewed)
            whereQuery = {
                ...whereQuery,
                reviewed
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