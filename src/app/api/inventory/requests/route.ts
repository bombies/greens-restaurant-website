import { authenticatedAny } from "../../../../utils/api/ApiUtils";
import Permission from "../../../../libs/types/permission";
import prisma from "../../../../libs/prisma";
import { NextResponse } from "next/server";
import { getFetchStockRequestsSearchParams } from "./me/route";

export async function GET(req: Request) {
    return authenticatedAny(req, async () => {
        const {rejected, reviewed} = getFetchStockRequestsSearchParams(req.url)
        const requests = await prisma.stockRequest.findMany({
            where: {
                reviewed,
                rejected
            }
        });
        return NextResponse.json(requests);
    }, [Permission.VIEW_STOCK_REQUESTS, Permission.MANAGE_STOCK_REQUESTS, Permission.CREATE_INVENTORY]);
}