import { authenticatedAny } from "../../../../../../../utils/api/ApiUtils";
import Permission from "../../../../../../../libs/types/permission";
import { NextResponse } from "next/server";
import inventoryService from "../../../../[name]/service";

type Context = {
    params: {
        name: string,
        sectionId: string,
    }
}

export async function GET(req: Request, { params }: Context) {
    return authenticatedAny(req, async () => {
        const fetchedSection = await inventoryService.fetchInventorySection(params.sectionId);
        return fetchedSection.error ?? NextResponse.json(fetchedSection.success);
    }, [
        Permission.CREATE_INVENTORY,
        Permission.VIEW_LOCATIONS,
        Permission.MUTATE_LOCATIONS
    ]);
}

export interface AddLocationStockDto {
    stockId: string;
}

export async function POST(req: Request, { params: { name: inventoryName, sectionId } }: Context) {
    return authenticatedAny(req, async () => {
        const body: AddLocationStockDto = await req.json();
        const createdStock = await inventoryService.createSectionStock(sectionId, body);
        return createdStock.error ?? NextResponse.json(createdStock.success!);
    }, [
        Permission.CREATE_INVENTORY,
        Permission.MUTATE_LOCATIONS
    ]);
}

export async function DELETE(req: Request, { params }: Context) {
    return authenticatedAny(req, async () => {
        const { searchParams } = new URL(req.url);
        const ids = searchParams.get("ids")?.split(",") ?? [];
        const deletedItems = await inventoryService.deleteSectionStocks(params.sectionId, ids);
        return deletedItems.error ?? NextResponse.json(deletedItems.success!);
    }, [
        Permission.CREATE_INVENTORY,
        Permission.MUTATE_LOCATIONS
    ]);
}