import { authenticatedAny } from "../../../../utils/api/ApiUtils";
import Permission from "../../../../libs/types/permission";
import { NextResponse } from "next/server";
import inventoryRequestsService from "./service";

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
            withLocation,
            sort,
            limit,
            cursor
        } = inventoryRequestsService.getFetchStockRequestsSearchParams(req.url);

        const requests = await inventoryRequestsService.fetchRequests({
            status,
            withUsers,
            withItems,
            withAssignees,
            from,
            to,
            withStock,
            withReviewer,
            withLocation,
            sort,
            limit, cursor
        });
        return NextResponse.json(requests);
    }, [Permission.VIEW_STOCK_REQUESTS, Permission.MANAGE_STOCK_REQUESTS, Permission.CREATE_INVENTORY]);
}