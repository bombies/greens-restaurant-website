import { authenticatedAny } from "../../../../../../../utils/api/ApiUtils";
import barService from "../../service";
import { NextResponse } from "next/server";
import Permission from "../../../../../../../libs/types/permission";


type Context = {
    params: {
        name: string,
        sectionId: string,
    }
}

export async function GET(req: Request, { params }: Context) {
    return authenticatedAny(req, async () => {
        const fetchedSnapshot = await barService.fetchMostRecentSnapshot(params.sectionId);
        return fetchedSnapshot.error ?? NextResponse.json(fetchedSnapshot.success);
    }, [
        Permission.CREATE_INVENTORY,
        Permission.VIEW_BAR_INVENTORY,
        Permission.MUTATE_BAR_INVENTORY
    ]);
}