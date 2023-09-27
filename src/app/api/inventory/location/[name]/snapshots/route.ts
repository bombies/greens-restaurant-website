import { authenticatedAny } from "../../../../../../utils/api/ApiUtils";
import Permission from "../../../../../../libs/types/permission";
import { NextResponse } from "next/server";
import inventoryService from "../../../[name]/service";
import { InventoryType } from ".prisma/client";

type Context = {
    params: {
        name: string
    }
}

export async function GET(req: Request, { params }: Context) {
    return authenticatedAny(req, async () => {
        const snapshots = await inventoryService.fetchSectionSnapshots(params.name, InventoryType.LOCATION);
        return snapshots.error ?? NextResponse.json(snapshots.success!);
    }, [
        Permission.CREATE_INVENTORY,
        Permission.VIEW_LOCATIONS,
        Permission.MUTATE_LOCATIONS
    ]);
}