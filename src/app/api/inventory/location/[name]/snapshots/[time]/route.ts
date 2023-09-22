import { authenticatedAny, respondWithInit } from "../../../../../../../utils/api/ApiUtils";
import Permission from "../../../../../../../libs/types/permission";
import { NextResponse } from "next/server";
import inventoryService from "../../../../[name]/service";
import { InventoryType } from ".prisma/client";

type Context = {
    params: {
        name: string,
        time: string,
    }
}

export async function GET(req: Request, { params }: Context) {
    return authenticatedAny(req, async () => {
        const time = Number(params.time);
        if (isNaN(time))
            return respondWithInit({
                message: "The time passed isn't a valid number!",
                status: 400
            });

        const snapshot = await inventoryService.fetchSnapshot(params.name, time, InventoryType.LOCATION);
        return snapshot.error ?? NextResponse.json(snapshot.success!);
    }, [
        Permission.VIEW_LOCATIONS,
        Permission.MUTATE_LOCATIONS,
        Permission.CREATE_INVENTORY
    ]);
}