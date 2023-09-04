import { authenticatedAny } from "../../../../../utils/api/ApiUtils";
import Permission from "../../../../../libs/types/permission";
import { NextResponse } from "next/server";
import inventoryService from "../service";
import { StockType } from "@prisma/client";

type RouteContext = {
    params: {
        name: string
    }
}

export async function GET(req: Request, { params }: RouteContext) {
    return authenticatedAny(req, async () => {
        const fetchedInventory = await inventoryService.fetchInventory(params.name, { stock: true });
        if (fetchedInventory.error)
            return fetchedInventory.error;
        return NextResponse.json(fetchedInventory.success!.stock);
    }, [Permission.CREATE_INVENTORY, Permission.MUTATE_STOCK, Permission.VIEW_INVENTORY]);
}

export interface CreateStockDto {
    name: string;
    type?: StockType;
    price?: number;
}

export async function POST(req: Request, { params }: RouteContext) {
    return authenticatedAny(req, async (_, axios) => {
        const body: CreateStockDto = await req.json();
        const createdStock = await inventoryService.createStock(params.name, body);
        if (createdStock.error)
            return createdStock.error;
        return NextResponse.json(createdStock.success);
    }, [Permission.MUTATE_STOCK, Permission.CREATE_INVENTORY]);
}

export async function DELETE(req: Request, { params }: RouteContext) {
    return authenticatedAny(req, async () => {
        const { searchParams } = new URL(req.url);
        const ids = searchParams.get("ids")?.split(",") ?? [];
        const deletedItems = await inventoryService.deleteStockItems(params.name, ids);
        return deletedItems.error ?? NextResponse.json(deletedItems.success!);
    }, [
        Permission.MUTATE_STOCK, Permission.CREATE_INVENTORY
    ]);
}