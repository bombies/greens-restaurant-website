import { authenticatedAny } from "../../../../utils/api/ApiUtils";
import Permission from "../../../../libs/types/permission";
import inventoryService from "../[name]/service";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    return authenticatedAny(req, async () => {
        const { searchParams } = new URL(req.url);
        const ids = searchParams.get("ids");

        if (!ids)
            return NextResponse.json([]);

        const parsedIds = ids.replaceAll(/\s/g, "").split(",");
        const fetchedSnapshots = await inventoryService.fetchCurrentSnapshots(parsedIds);
        if (fetchedSnapshots.error)
            return fetchedSnapshots.error;
        return NextResponse.json(fetchedSnapshots.success);
    }, [
        Permission.VIEW_INVENTORY,
        Permission.MUTATE_STOCK,
        Permission.CREATE_INVENTORY
    ]);
}