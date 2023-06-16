import { authenticated, authenticatedAny, respond } from "../../../utils/api/ApiUtils";
import Permission from "../../../libs/types/permission";
import prisma from "../../../libs/prisma";
import { NextResponse } from "next/server";
import { INVENTORY_NAME_REGEX } from "../../../utils/regex";
import { v4 } from "uuid";

export function GET(req: Request) {
    return authenticatedAny(req, async () => {
        const inventories = await prisma.inventory.findMany();
        return NextResponse.json(inventories);
    }, [
        Permission.CREATE_INVENTORY,
        Permission.VIEW_INVENTORY,
        Permission.MUTATE_STOCK
    ]);
}

export type CreateInventoryDto = {
    name: string,
    createdBy?: string,
}

export function POST(req: Request) {
    return authenticated(req, async () => {
        const { name, createdBy }: CreateInventoryDto = await req.json();
        if (!name || !createdBy)
            return respond({
                message: "Malformed body!",
                init: {
                    status: 401
                }
            });

        if (!INVENTORY_NAME_REGEX.test(name))
            return respond({
                message: "Invalid inventory name! " +
                    "The inventory name must not be more than 30 characters. " +
                    "It should also not include any special characters. " +
                    "The inventory name must also start with a letter.",
                init: {
                    status: 401
                }
            });

        const validName = name
            .toLowerCase()
            .trim()
            .replaceAll(/\s{2,}/g, " ")
            .replaceAll(" ", "-");

        const existingInventory = await prisma.inventory.findUnique({
            where: { name: validName }
        });

        if (existingInventory)
            return respond({
                message: `There is already an inventory with the name: ${validName.replaceAll("-", " ")}`,
                init: {
                    status: 401
                }
            });

        const inventory = await prisma.inventory.create({
            data: {
                name: validName,
                uid: v4(),
                createdByUserId: createdBy
            }
        });

        return NextResponse.json(inventory);
    }, Permission.CREATE_INVENTORY);
}