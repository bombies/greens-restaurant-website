import { authenticatedAny } from "../../../../../../utils/api/ApiUtils";
import { fetchCurrentSnapshot } from "../../../[name]/utils";
import { NextResponse } from "next/server";
import { InventoryType } from ".prisma/client";
import Permission from "../../../../../../libs/types/permission";

type Context = {
    params: {
        name: string
    }
}

export async function GET(req: Request, { params }: Context) {
    return authenticatedAny(req, async () => {
        const fetchedSnapshot = await fetchCurrentSnapshot(params.name, InventoryType.BAR);
        if (fetchedSnapshot.error)
            return fetchedSnapshot.error;
        return NextResponse.json(fetchedSnapshot.success);
    }, [
        Permission.CREATE_INVENTORY,
        Permission.VIEW_BAR_INVENTORY,
        Permission.MUTATE_BAR_INVENTORY
    ]);
}