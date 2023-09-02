import { authenticatedAny } from "../../../../../../../utils/api/ApiUtils";
import Permission from "../../../../../../../libs/types/permission";
import barService from "../../service";
import { NextResponse } from "next/server";
import { CreateStockDto } from "../../../../[name]/stock/route";
import { StockType } from "@prisma/client";

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
    type?: StockType;
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