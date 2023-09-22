import { authenticatedAny } from "../../../../../../../../utils/api/ApiUtils";
import Permission from "../../../../../../../../libs/types/permission";
import { NextResponse } from "next/server";
import { UpdateStockDto } from "../../../../../[name]/stock/[id]/route";
import inventoryService from "../../../../../[name]/service";

type Context = {
    params: {
        name: string,
        sectionId: string,
        stockUID: string,
    }
}

export async function GET(req: Request, { params }: Context) {
    return authenticatedAny(req, async () => {
        const fetchedItem = await inventoryService.fetchSectionStock(params.sectionId, params.stockUID);
        return fetchedItem.error ?? NextResponse.json(fetchedItem.success!);
    }, [
        Permission.CREATE_INVENTORY,
        Permission.VIEW_LOCATIONS,
        Permission.MUTATE_LOCATIONS
    ]);
}

export type UpdateLocationSectionStockDto = Pick<Partial<UpdateStockDto>, "quantity" | "sellingPrice">

export async function PATCH(req: Request, { params }: Context) {
    return authenticatedAny(req, async () => {
        const body: UpdateLocationSectionStockDto = await req.json();
        const updatedItem = await inventoryService.updateSectionStockItem(params.sectionId, params.stockUID, body);
        return updatedItem.error ?? NextResponse.json(updatedItem.success!);
    }, [
        Permission.CREATE_INVENTORY,
        Permission.MUTATE_LOCATIONS
    ]);
}

export async function DELETE(req: Request, { params }: Context) {
    return authenticatedAny(req, async () => {
        const deletedItem = await inventoryService.deleteSectionStock(params.sectionId, params.stockUID);
        return deletedItem.error ?? NextResponse.json(deletedItem.success!);
    }, [
        Permission.CREATE_INVENTORY,
        Permission.MUTATE_LOCATIONS
    ]);
}