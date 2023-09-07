import { authenticatedAny } from "../../../../../../utils/api/ApiUtils";
import Permission from "../../../../../../libs/types/permission";
import barService from "../service";
import { UpdateInventorySectionDto } from "../types";
import { NextResponse } from "next/server";

type Context = {
    params: {
        name: string,
        sectionId: string,
    }
}

export async function GET(req: Request, { params }: Context) {
    return authenticatedAny(req, async () => {
        const fetchedSection = await barService.fetchInventorySection(params.sectionId);
        return fetchedSection.error ?? NextResponse.json(fetchedSection.success!);
    }, [
        Permission.CREATE_INVENTORY,
        Permission.VIEW_BAR_INVENTORY,
        Permission.MUTATE_BAR_INVENTORY
    ]);
}

export async function PATCH(req: Request, { params }: Context) {
    return authenticatedAny(req, async () => {
        const body: UpdateInventorySectionDto = await req.json();
        const updatedSection = await barService.updateInventorySection(params.sectionId, body);
        return updatedSection.error ?? NextResponse.json(updatedSection.success!);
    }, [
        Permission.CREATE_INVENTORY,
        Permission.MUTATE_BAR_INVENTORY
    ]);
}

export async function DELETE(req: Request, { params }: Context) {
    return authenticatedAny(req, async () => {
        const deleted = await barService.deleteInventorySection(params.sectionId);
        return deleted.error ?? NextResponse.json(deleted.success!);
    }, [
        Permission.CREATE_INVENTORY,
        Permission.MUTATE_BAR_INVENTORY
    ]);
}