import { authenticatedAny } from "../../../../../../../utils/api/ApiUtils";
import Permission from "../../../../../../../libs/types/permission";
import { deleteStockItem, fetchStockItem, updateStockItem } from "../../../../[name]/utils";
import { NextResponse } from "next/server";
import { InventoryType } from ".prisma/client";
import { UpdateStockDto } from "../../../../[name]/stock/[id]/route";

type Context = {
    params: {
        name: string,
        id: string,
    }
}

export async function GET(req: Request, { params }: Context) {
    return authenticatedAny(req, async () => {
        const fetchedItem = await fetchStockItem(params.name, params.id, InventoryType.BAR);
        return fetchedItem.error ?? NextResponse.json(fetchedItem.success);
    }, [
        Permission.CREATE_INVENTORY,
        Permission.VIEW_BAR_INVENTORY,
        Permission.MUTATE_BAR_INVENTORY
    ]);
}

export async function PATCH(req: Request, { params }: Context) {
    return authenticatedAny(req, async () => {
        const dto: UpdateStockDto = await req.json();
        const updatedItem = await updateStockItem(params.name, params.id, dto, InventoryType.BAR);
        return updatedItem.error ?? NextResponse.json(updatedItem.success!);
    }, [
        Permission.CREATE_INVENTORY,
        Permission.MUTATE_BAR_INVENTORY
    ]);
}

export async function DELETE(req: Request, { params }: Context) {
    return authenticatedAny(req, async () => {
        const deletedItem = await deleteStockItem(params.name, params.id, InventoryType.BAR);
        return deletedItem.error ?? NextResponse.json(deletedItem.success!);
    }, [
        Permission.CREATE_INVENTORY,
        Permission.MUTATE_BAR_INVENTORY
    ]);
}