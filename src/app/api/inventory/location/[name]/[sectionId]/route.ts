import { authenticatedAny } from "../../../../../../utils/api/ApiUtils";
import Permission from "../../../../../../libs/types/permission";
import { UpdateInventorySectionDto } from "../types";
import { NextResponse } from "next/server";
import inventoryService from "../../../[name]/service";

type Context = {
    params: {
        name: string,
        sectionId: string,
    }
}

export async function GET(req: Request, { params }: Context) {
    return authenticatedAny(req, async () => {
        const fetchedSection = await inventoryService.fetchInventorySection(params.sectionId);
        return fetchedSection.error ?? NextResponse.json(fetchedSection.success!);
    }, [
        Permission.CREATE_INVENTORY,
        Permission.VIEW_LOCATIONS,
        Permission.MUTATE_LOCATIONS
    ]);
}

export async function PATCH(req: Request, { params }: Context) {
    return authenticatedAny(req, async () => {
        const body: UpdateInventorySectionDto = await req.json();
        const updatedSection = await inventoryService.updateInventorySection(params.sectionId, body);
        return updatedSection.error ?? NextResponse.json(updatedSection.success!);
    }, [
        Permission.CREATE_INVENTORY,
        Permission.MUTATE_LOCATIONS
    ]);
}

export async function DELETE(req: Request, { params }: Context) {
    return authenticatedAny(req, async () => {
        const deleted = await inventoryService.deleteInventorySection(params.sectionId);
        return deleted.error ?? NextResponse.json(deleted.success!);
    }, [
        Permission.CREATE_INVENTORY,
        Permission.MUTATE_LOCATIONS
    ]);
}