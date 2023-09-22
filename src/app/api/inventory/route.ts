import { authenticated, authenticatedAny, respond, respondWithInit } from "../../../utils/api/ApiUtils";
import Permission from "../../../libs/types/permission";
import prisma from "../../../libs/prisma";
import { NextResponse } from "next/server";
import { INVENTORY_NAME_REGEX } from "../../../utils/regex";
import { v4 } from "uuid";
import { InventoryType, Prisma } from ".prisma/client";
import { StockType } from "@prisma/client";
import InventoryWhereInput = Prisma.InventoryWhereInput;
import { CreateInventoryDto, createInventoryDtoSchema } from "./[name]/types";
import inventoryService from "./[name]/service";

export function GET(req: Request) {
    return authenticatedAny(req, async () => {
        const { searchParams } = new URL(req.url);
        const ids = searchParams.get("ids")?.replaceAll(/\s/g, "").split(",").filter(id => id.length > 0);
        const withStock = searchParams.get("with_stock") === "true";
        let whereQuery: InventoryWhereInput = {};

        if (ids && ids.length)
            whereQuery = {
                ...whereQuery,
                id: {
                    in: ids
                }
            };

        const inventories = await prisma.inventory.findMany({
            where: whereQuery,
            include: {
                stock: withStock
            }
        });
        return NextResponse.json(inventories.filter(inv => inv.type === null || inv.type === StockType.DEFAULT));
    }, [
        Permission.CREATE_INVENTORY,
        Permission.CREATE_STOCK_REQUEST,
        Permission.MANAGE_STOCK_REQUESTS,
        Permission.VIEW_STOCK_REQUESTS,
        Permission.VIEW_INVENTORY,
        Permission.MUTATE_STOCK
    ]);
}

export function POST(req: Request) {
    return authenticated(req, async (session) => {
        const body: CreateInventoryDto = await req.json();
        const inventory = await inventoryService.createInventory(body, session);
        return inventory.error ?? NextResponse.json(inventory.success!);
    }, Permission.CREATE_INVENTORY);
}