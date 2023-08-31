import { CreateStockDto } from "../../../[name]/stock/route";
import { StockType } from "@prisma/client";
import { z } from "zod";
import { authenticatedAny, respondWithInit } from "../../../../../../utils/api/ApiUtils";
import { createStock, fetchInventory } from "../../../[name]/utils";
import { NextResponse } from "next/server";
import Permission from "../../../../../../libs/types/permission";
import { InventoryType } from ".prisma/client";

type Context = {
    params: {
        name: string
    }
}

export async function GET(req: Request, { params }: Context) {
    return authenticatedAny(req, async () => {
        const fetchedInventory = await fetchInventory(params.name, { bar: true, stock: true });
        return fetchedInventory.error ?? NextResponse.json(fetchedInventory.success!.stock);
    }, [
        Permission.CREATE_INVENTORY,
        Permission.VIEW_BAR_INVENTORY,
        Permission.MUTATE_BAR_INVENTORY
    ]);
}

export interface CreateBarStockDto extends CreateStockDto {
    type?: StockType;
}

const createBarStockDtoSchema = z.object({
    name: z.string(),
    type: z.string().optional()
}).strict();

export async function POST(req: Request, { params }: Context) {
    return authenticatedAny(req, async (_, axios) => {
        const body: CreateBarStockDto = await req.json();
        const bodyValidated = createBarStockDtoSchema.safeParse(body);
        if (!bodyValidated.success)
            return respondWithInit({
                message: "Invalid body!",
                validationErrors: bodyValidated,
                status: 401
            });

        const createdStock = await createStock(params.name, body, InventoryType.BAR);
        if (createdStock.error)
            return createdStock.error;
        return NextResponse.json(createdStock.success);
    }, [Permission.MUTATE_STOCK, Permission.CREATE_INVENTORY]);
}