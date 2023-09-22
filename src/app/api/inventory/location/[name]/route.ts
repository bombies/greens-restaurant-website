import { authenticatedAny } from "../../../../../utils/api/ApiUtils";
import Permission from "../../../../../libs/types/permission";
import { NextResponse } from "next/server";
import { CreateInventorySectionDto } from "./types";
import inventoryService from "../../[name]/service";
import { InventoryType } from ".prisma/client";

type Context = {
    params: {
        name: string
    }
}

export async function GET(req: Request, { params }: Context) {
    return authenticatedAny(req, async () => {
        const sections = await inventoryService.fetchInventorySections(params.name, InventoryType.LOCATION);
        return sections.error ?? NextResponse.json(sections.success);
    }, [
        Permission.CREATE_INVENTORY,
        Permission.MUTATE_LOCATIONS,
        Permission.VIEW_LOCATIONS
    ]);
}

export async function POST(req: Request, { params }: Context) {
    return authenticatedAny(req, async () => {
        const body: CreateInventorySectionDto = await req.json();
        const createdSection = await inventoryService.createInventorySection(params.name, body, InventoryType.LOCATION);
        return createdSection.error ?? NextResponse.json(createdSection.success);
    }, [
        Permission.CREATE_INVENTORY,
        Permission.MUTATE_LOCATIONS
    ]);
}