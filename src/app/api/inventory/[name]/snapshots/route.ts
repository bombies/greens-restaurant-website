import { authenticatedAny } from "../../../../../utils/api/ApiUtils";
import { NextResponse } from "next/server";
import Permission from "../../../../../libs/types/permission";
import inventoryService from "../service";

type RouteContext = {
    params: {
        name: string
    }
}

export async function GET(req: Request, { params }: RouteContext) {
    return authenticatedAny(req, async () => {
        const fetchResult = await inventoryService.fetchInventory(params.name, {
            snapshots: true
        });
        if (fetchResult.error)
            return fetchResult.error;
        return NextResponse.json(fetchResult.success);
    }, [Permission.VIEW_INVENTORY, Permission.MUTATE_STOCK, Permission.CREATE_INVENTORY]);
}