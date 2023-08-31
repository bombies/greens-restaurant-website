import { authenticatedAny } from "../../../../../../../utils/api/ApiUtils";
import Permission from "../../../../../../../libs/types/permission";
import { NextResponse } from "next/server";
import { updateCurrentStockSnapshot } from "../../../utils";

type RouteContext = {
    params: {
        name: string,
        id: string
    }
}

export type UpdateStockQuantityDto = {
    quantity: number,
}

export async function POST(req: Request, { params }: RouteContext) {
    return authenticatedAny(req, async () => {
        const dto: UpdateStockQuantityDto = await req.json();
        const updatedSnapshot = await updateCurrentStockSnapshot(params.name, params.id, dto);
        return updatedSnapshot.error ?? NextResponse.json(updatedSnapshot.success);
    }, [Permission.CREATE_INVENTORY, Permission.MUTATE_STOCK]);
}