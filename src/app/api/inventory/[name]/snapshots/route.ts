import { authenticatedAny } from "../../../../../utils/api/ApiUtils";
import { fetchInventory } from "../utils";
import { NextResponse } from "next/server";
import Permission from "../../../../../libs/types/permission";

type RouteContext = {
    params: {
        name: string
    }
}

export async function GET(req: Request, { params }: RouteContext) {
    return authenticatedAny(req, async () => {
        const fetchResult = await fetchInventory(params.name, {
            snapshots: true
        });
        if (fetchResult.error)
            return fetchResult.error;
        return NextResponse.json(fetchResult.success);
    }, [Permission.VIEW_INVENTORY, Permission.MUTATE_STOCK, Permission.CREATE_INVENTORY]);
}