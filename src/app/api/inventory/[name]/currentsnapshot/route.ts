import { authenticatedAny } from "../../../../../utils/api/ApiUtils";
import Permission from "../../../../../libs/types/permission";
import { NextResponse } from "next/server";
import inventoryService from "../service";

type RouteContext = {
    params: {
        name: string
    }
}

export async function GET(req: Request, { params }: RouteContext) {
    return authenticatedAny(req, async () => {
        const fetchedSnapshot = await inventoryService.fetchCurrentSnapshot(params.name);
        if (fetchedSnapshot.error)
            return fetchedSnapshot.error;
        return NextResponse.json(fetchedSnapshot.success);
    }, [Permission.VIEW_INVENTORY, Permission.MUTATE_STOCK, Permission.CREATE_INVENTORY]);
}