import { authenticatedAny } from "../../../../../../../../utils/api/ApiUtils";
import Permission from "../../../../../../../../libs/types/permission";
import barService from "../../../service";
import { NextResponse } from "next/server";
import { UpdateStockDto } from "../../../../../[name]/stock/[id]/route";
import { StockType } from "@prisma/client";

type Context = {
    params: {
        name: string,
        sectionId: string,
        stockUID: string,
    }
}

export async function GET(req: Request, { params }: Context) {
    return authenticatedAny(req, async () => {
        const fetchedItem = await barService.fetchSectionStock(params.sectionId, params.stockUID);
        return fetchedItem.error ?? NextResponse.json(fetchedItem.success!);
    }, [
        Permission.CREATE_INVENTORY,
        Permission.VIEW_BAR_INVENTORY,
        Permission.MUTATE_BAR_INVENTORY
    ]);
}

export type UpdateBarSectionStockDto = Partial<UpdateStockDto> & {
    type?: StockType
}

export async function PATCH(req: Request, { params }: Context) {
    return authenticatedAny(req, async () => {
        const body: UpdateBarSectionStockDto = await req.json();
        const updatedItem = await barService.updateSectionStock(params.sectionId, params.stockUID, body);
        return updatedItem.error ?? NextResponse.json(updatedItem.success!);
    }, [
        Permission.CREATE_INVENTORY,
        Permission.MUTATE_BAR_INVENTORY
    ]);
}

export async function DELETE(req: Request, { params }: Context) {
    return authenticatedAny(req, async () => {
        const deletedItem = await barService.deleteSectionStock(params.sectionId, params.stockUID);
        return deletedItem.error ?? NextResponse.json(deletedItem.success!);
    }, [
        Permission.CREATE_INVENTORY,
        Permission.MUTATE_BAR_INVENTORY
    ]);
}