import { authenticatedAny } from "../../../../../../../utils/api/ApiUtils";
import { NextResponse } from "next/server";
import Permission from "../../../../../../../libs/types/permission";
import inventoryService from "../../../../[name]/service";


type Context = {
    params: {
        name: string,
        sectionId: string,
    }
}

export async function GET(req: Request, { params }: Context) {
    return authenticatedAny(req, async () => {
        const fetchedSnapshot = await inventoryService.fetchMostRecentSnapshot(params.sectionId);
        return fetchedSnapshot.error ?? NextResponse.json(fetchedSnapshot.success);
    }, [
        Permission.CREATE_INVENTORY,
        Permission.VIEW_LOCATIONS,
        Permission.MUTATE_LOCATIONS
    ]);
}