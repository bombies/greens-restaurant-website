import { authenticatedAny, respond } from "../../../../../utils/api/ApiUtils";
import Permission from "../../../../../libs/types/permission";
import prisma from "../../../../../libs/prisma";
import { NextResponse } from "next/server";
import { INVENTORY_NAME_REGEX } from "../../../../../utils/regex";
import { v4 } from "uuid";
import { createStock, createStockSnapshot, deleteStockItems, fetchInventory } from "../utils";
import { z } from "zod";
import { StockType } from "@prisma/client";

type RouteContext = {
    params: {
        name: string
    }
}

export async function GET(req: Request, { params }: RouteContext) {
    return authenticatedAny(req, async () => {
        const fetchedInventory = await fetchInventory(params.name, { stock: true });
        if (fetchedInventory.error)
            return fetchedInventory.error;
        return NextResponse.json(fetchedInventory.success!.stock);
    }, [Permission.CREATE_INVENTORY, Permission.MUTATE_STOCK, Permission.VIEW_INVENTORY]);
}

export interface CreateStockDto {
    name: string;
    type?: StockType;
}

export async function POST(req: Request, { params }: RouteContext) {
    return authenticatedAny(req, async (_, axios) => {
        const body: CreateStockDto = await req.json();
        const createdStock = await createStock(params.name, body);
        if (createdStock.error)
            return createdStock.error;
        return NextResponse.json(createdStock.success);
    }, [Permission.MUTATE_STOCK, Permission.CREATE_INVENTORY]);
}

export async function DELETE(req: Request, { params }: RouteContext) {
    return authenticatedAny(req, async () => {
        const { searchParams } = new URL(req.url);
        const ids = searchParams.get("ids")?.split(",") ?? [];
        const deletedItems = await deleteStockItems(params.name, ids);
        return deletedItems.error ?? NextResponse.json(deletedItems.success!);
    }, [
        Permission.MUTATE_STOCK, Permission.CREATE_INVENTORY
    ]);
}