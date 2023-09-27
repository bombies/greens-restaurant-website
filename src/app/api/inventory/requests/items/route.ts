import { authenticatedAny, respondWithInit } from "../../../../../utils/api/ApiUtils";
import Permission from "../../../../../libs/types/permission";
import inventoryRequestsService from "../service";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    return authenticatedAny(req, async () => {
        const { searchParams } = new URL(req.url);
        let ids = searchParams.get("ids")?.split(",");
        const assignedLocationName = searchParams.get("loc_name") ?? undefined;
        const from = searchParams.get("from") ? Number(searchParams.get("from")) : undefined;
        const to = searchParams.get("to") ? Number(searchParams.get("to")) : undefined;

        if (!ids)
            return respondWithInit({
                message: "You didn't provide any IDs to fetch!",
                status: 400
            });

        ids = ids.filter(id => id.length);
        const items = await inventoryRequestsService.fetchRequestedItems({
            stockIds: ids,
            from, to,
            locationName: assignedLocationName
        });
        return items.error ?? NextResponse.json(items.success!);
    }, [
        Permission.VIEW_STOCK_REQUESTS,
        Permission.MANAGE_STOCK_REQUESTS,
        Permission.CREATE_INVENTORY,
        Permission.MUTATE_LOCATIONS,
        Permission.VIEW_LOCATIONS
    ]);
}