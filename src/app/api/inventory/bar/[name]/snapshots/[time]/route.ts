import { authenticatedAny, respondWithInit } from "../../../../../../../utils/api/ApiUtils";
import Permission from "../../../../../../../libs/types/permission";
import barService from "../../service";
import { NextResponse } from "next/server";

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

        const snapshot = await barService.fetchSnapshot(params.name, time);
        return snapshot.error ?? NextResponse.json(snapshot.success!);
    }, [
        Permission.VIEW_BAR_INVENTORY,
        Permission.MUTATE_BAR_INVENTORY,
        Permission.CREATE_INVENTORY
    ]);
}