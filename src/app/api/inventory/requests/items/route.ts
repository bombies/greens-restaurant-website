import { authenticatedAny, respondWithInit } from "../../../../../utils/api/ApiUtils";
import Permission from "../../../../../libs/types/permission";
import inventoryRequestsService from "../service";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    return authenticatedAny(req, async () => {
        const { searchParams } = new URL(req.url);
        const ids = searchParams.get("ids")?.split(",");
        const from: number | undefined = searchParams.get("from") ? Number(searchParams.get("from")) : undefined;
        const to: number | undefined = searchParams.get("to") ? Number(searchParams.get("to")) : undefined;

        if (!ids)
            return respondWithInit({
                message: "You didn't provide any IDs to fetch!",
                status: 400
            });

        const items = await inventoryRequestsService.fetchRequestedItems({
            stockIds: ids,
            from, to
        });
        return items.error ?? NextResponse.json(items.success!);
    }, [
        Permission.VIEW_STOCK_REQUESTS,
        Permission.MANAGE_STOCK_REQUESTS,
        Permission.CREATE_INVENTORY,
        Permission.MUTATE_BAR_INVENTORY,
        Permission.VIEW_BAR_INVENTORY
    ]);
}