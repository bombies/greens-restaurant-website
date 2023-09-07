import { authenticatedAny } from "../../../../../../utils/api/ApiUtils";
import Permission from "../../../../../../libs/types/permission";
import barService from "../service";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    return authenticatedAny(req, async () => {
        const snapshots = await barService.fetchSnapshots("bar");
        return snapshots.error ?? NextResponse.json(snapshots.success!);
    }, [
        Permission.CREATE_INVENTORY,
        Permission.VIEW_BAR_INVENTORY,
        Permission.MUTATE_BAR_INVENTORY
    ]);
}