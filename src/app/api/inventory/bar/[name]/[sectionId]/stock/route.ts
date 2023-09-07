import { authenticatedAny } from "../../../../../../../utils/api/ApiUtils";
import Permission from "../../../../../../../libs/types/permission";
import barService from "../../service";
import { NextResponse } from "next/server";
import { CreateStockDto } from "../../../../[name]/stock/route";

type Context = {
    params: {
        name: string,
        sectionId: string,
    }
}

export async function GET(req: Request, { params }: Context) {
    return authenticatedAny(req, async () => {
        const fetchedSection = await barService.fetchInventorySection(params.sectionId);
        return fetchedSection.error ?? NextResponse.json(fetchedSection.success);
    }, [
        Permission.CREATE_INVENTORY,
        Permission.VIEW_BAR_INVENTORY,
        Permission.MUTATE_BAR_INVENTORY
    ]);
}

export interface CreateBarStockDto extends CreateStockDto {
}

export async function POST(req: Request, { params }: Context) {
    return authenticatedAny(req, async () => {
        const body: CreateBarStockDto = await req.json();
        const createdStock = await barService.createSectionStock(params.sectionId, body);
        return createdStock.error ?? NextResponse.json(createdStock.success!);
    }, [
        Permission.CREATE_INVENTORY,
        Permission.MUTATE_BAR_INVENTORY
    ]);
}

export async function DELETE(req: Request, { params }: Context) {
    return authenticatedAny(req, async () => {
        const { searchParams } = new URL(req.url);
        const ids = searchParams.get("ids")?.split(",") ?? [];
        const deletedItems = await barService.deleteSectionStocks(params.sectionId, ids);
        return deletedItems.error ?? NextResponse.json(deletedItems.success!);
    }, [
        Permission.CREATE_INVENTORY,
        Permission.MUTATE_BAR_INVENTORY
    ]);
}