import { authenticatedAny, respond } from "../../../../../utils/api/ApiUtils";
import Permission from "../../../../../libs/types/permission";
import prisma from "../../../../../libs/prisma";
import { NextResponse } from "next/server";
import { INVENTORY_NAME_REGEX } from "../../../../../utils/regex";
import { v4 } from "uuid";
import { createStockSnapshot, fetchInventory } from "../utils";

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

type CreateStockDto = {
    name: string
}

export async function POST(req: Request, { params }: RouteContext) {
    return authenticatedAny(req, async (_, axios) => {
        const fetchedInventory = await fetchInventory(params.name, { stock: true });
        if (fetchedInventory.error)
            return fetchedInventory.error;
        const inventory = fetchedInventory.success!;

        const body: CreateStockDto = await req.json();
        if (!body.name)
            return respond({
                message: "Malformed body!",
                init: {
                    status: 401
                }
            });

        if (!INVENTORY_NAME_REGEX.test(body.name))
            return respond({
                message: "Invalid item name! " +
                    "The item name must not be more than 30 characters. " +
                    "It should also not include any special characters. " +
                    "The item name must also start with a letter.",
                init: {
                    status: 401
                }
            });

        const validName = body.name
            .toLowerCase()
            .trim()
            .replaceAll(/\s{2,}/g, " ")
            .replaceAll(/\s/g, "-");

        if (inventory.stock?.find(item => item.name === validName))
            return respond({
                message: "There is already an item with that name in this inventory!",
                init: {
                    status: 401
                }
            });

        const createdStock = await prisma.stock.create({
            data: {
                name: validName,
                inventoryId: inventory.id,
                uid: v4()
            }
        });

        const createdStockSnapshot = await createStockSnapshot(params.name, {
            name: validName
        });

        if (createdStockSnapshot.error)
            return createdStockSnapshot.error;
        return NextResponse.json(createdStock);
    }, [Permission.MUTATE_STOCK, Permission.CREATE_INVENTORY]);
}