import { authenticatedAny } from "../../../../../../utils/api/ApiUtils";
import Permission from "../../../../../../libs/types/permission";
import { NextResponse } from "next/server";
import { deleteStockItem, fetchStockItem, updateStockItem } from "../../utils";

type RouteContext = {
    params: {
        name: string,
        id: string
    }
}

export function GET(req: Request, { params }: RouteContext) {
    return authenticatedAny(req, async () => {
        const fetchedItem = await fetchStockItem(params.name, params.id);
        return fetchedItem.error ?? NextResponse.json(fetchedItem.success);
    }, [Permission.CREATE_INVENTORY, Permission.MUTATE_STOCK, Permission.VIEW_INVENTORY]);
}

export type UpdateStockDto = Partial<{
    name: string,
    price: number,
    quantity: number,
}>

export function PATCH(req: Request, { params }: RouteContext) {
    return authenticatedAny(req, async () => {
        const dto: UpdateStockDto = await req.json();
        const updatedItem = await updateStockItem(params.name, params.id, dto);
        return updatedItem.error ?? NextResponse.json(updatedItem.success!);
    }, [Permission.MUTATE_STOCK, Permission.CREATE_INVENTORY]);
}

export function DELETE(req: Request, { params }: RouteContext) {
    return authenticatedAny(req, async () => {
        const deletedItem = await deleteStockItem(params.name, params.id);
        return deletedItem.error ?? NextResponse.json(deletedItem.success);
    }, [Permission.MUTATE_STOCK, Permission.CREATE_INVENTORY]);
}