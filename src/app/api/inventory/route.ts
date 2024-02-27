import { authenticated, authenticatedAny } from "../../../utils/api/ApiUtils";
import Permission from "../../../libs/types/permission";
import prisma from "../../../libs/prisma";
import { NextResponse } from "next/server";
import { InventoryType, Prisma } from ".prisma/client";
import InventoryWhereInput = Prisma.InventoryWhereInput;
import { CreateInventoryDto, InventoryWithOptionalExtras } from "./[name]/types";
import inventoryService from "./[name]/service";
import { itemHasLowStock } from "@/app/(site)/(accessible-site)/inventory/utils/inventory-utils";
import configService from "../config/service";

export function GET(req: Request) {
    return authenticatedAny(req, async () => {
        const { searchParams } = new URL(req.url);
        const ids = searchParams.get("ids")?.replaceAll(/\s/g, "").split(",").filter(id => id.length > 0);
        const withStock = searchParams.get("with_stock") === "true";
        const withLowStock = searchParams.get("with_low_stock") === "true";

        let whereQuery: InventoryWhereInput = {
            OR: [
                { type: { isSet: false } },
                { type: InventoryType.DEFAULT }
            ]
        };

        if (ids && ids.length)
            whereQuery = {
                ...whereQuery,
                id: {
                    in: ids
                }
            };

        const inventories: InventoryWithOptionalExtras[] = await prisma.inventory.findMany({
            where: whereQuery,
            include: {
                stock: withStock
            }
        });

        if (withLowStock) {
            const inventorySnapshots = await inventoryService.fetchCurrentSnapshotsHeadless(inventories.map(inventory => inventory.id));
            
            if (inventorySnapshots && inventorySnapshots.length > 0) {
                const config = await configService.getConfig();
                inventories.forEach(inventory => {
                    const snapshot = inventorySnapshots.find(snapshot => snapshot.inventoryId === inventory.id);
                    
                    if (snapshot) {
                        const lowStockItems = snapshot
                            .stockSnapshots
                            ?.filter(stockSnapshot => itemHasLowStock(config, stockSnapshot))
                        
                        inventory.lowStock = lowStockItems;
                    }
                });
            }
        }


        return NextResponse.json(inventories);
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