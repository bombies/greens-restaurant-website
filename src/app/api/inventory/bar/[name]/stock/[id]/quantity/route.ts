import { authenticatedAny } from "../../../../../../../../utils/api/ApiUtils";
import Permission from "../../../../../../../../libs/types/permission";
import { updateCurrentStockSnapshot } from "../../../../../[name]/utils";
import { NextResponse } from "next/server";
import { UpdateStockQuantityDto } from "../../../../../[name]/stock/[id]/quantity/route";
import { InventoryType } from ".prisma/client";

type Context = {
    params: {
        name: string,
        id: string,
    }
}

export async function POST(req: Request, { params }: Context) {
    return authenticatedAny(req, async () => {
        const dto: UpdateStockQuantityDto = await req.json();
        const updatedSnapshot = await updateCurrentStockSnapshot(params.name, params.id, dto, InventoryType.BAR);
        return updatedSnapshot.error ?? NextResponse.json(updatedSnapshot.success);
    }, [
        Permission.CREATE_INVENTORY,
        Permission.MUTATE_BAR_INVENTORY
    ]);
}