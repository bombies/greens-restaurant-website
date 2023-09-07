import { authenticatedAny } from "../../../../../utils/api/ApiUtils";
import Permission from "../../../../../libs/types/permission";
import { NextResponse } from "next/server";
import barService from "./service";
import { CreateInventorySectionDto } from "./types";

type Context = {
    params: {
        name: string
    }
}

export async function GET(req: Request, { params }: Context) {
    return authenticatedAny(req, async () => {
        const sections = await barService.fetchInventorySections(params.name);
        return sections.error ?? NextResponse.json(sections.success);
    }, [
        Permission.CREATE_INVENTORY,
        Permission.MUTATE_BAR_INVENTORY,
        Permission.VIEW_BAR_INVENTORY
    ]);
}

export async function POST(req: Request, { params }: Context) {
    return authenticatedAny(req, async () => {
        const body: CreateInventorySectionDto = await req.json();
        const createdSection = await barService.createInventorySection(params.name, body);
        return createdSection.error ?? NextResponse.json(createdSection.success);
    }, [
        Permission.CREATE_INVENTORY,
        Permission.MUTATE_BAR_INVENTORY
    ]);
}