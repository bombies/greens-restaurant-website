import { authenticatedAny } from "../../../../utils/api/ApiUtils";
import Permission from "../../../../libs/types/permission";
import inventoryService from "../[name]/service";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    return authenticatedAny(req, async () => {
        const items = await inventoryService.fetchStockItems();
        return items.error ?? NextResponse.json(items.success!);
    }, [
        Permission.VIEW_INVENTORY,
        Permission.MUTATE_STOCK,
        Permission.CREATE_INVENTORY,
        Permission.VIEW_LOCATIONS,
        Permission.MUTATE_LOCATIONS
    ]);
}