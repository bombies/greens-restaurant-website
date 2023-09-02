import { authenticatedAny } from "../../../../../../../../../utils/api/ApiUtils";
import Permission from "../../../../../../../../../libs/types/permission";
import { UpdateStockQuantityDto } from "../../../../../../[name]/stock/[id]/quantity/route";
import { NextResponse } from "next/server";
import barService from "../../../../service";

type Context = {
    params: {
        name: string,
        sectionId: string,
        stockUID: string,
    }
}

export async function PATCH(req: Request, { params }: Context) {
    return authenticatedAny(req, async () => {
        const dto: UpdateStockQuantityDto = await req.json();
        const updatedSnapshot = await barService.updateCurrentSectionStockSnapshot(params.sectionId, params.stockUID, dto);
        return updatedSnapshot.error ?? NextResponse.json(updatedSnapshot.success);
    }, [
        Permission.CREATE_INVENTORY,
        Permission.MUTATE_BAR_INVENTORY
    ]);
}