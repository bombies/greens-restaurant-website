import { authenticated, authenticatedAny, respond } from "../../../../utils/api/ApiUtils";
import Permission from "../../../../libs/types/permission";
import prisma from "../../../../libs/prisma";
import { NextResponse } from "next/server";
import { fetchInventory, generateValidInventoryName } from "./utils";

type RouteContext = {
    params: {
        name: string
    }
}

export async function GET(req: Request, { params }: RouteContext) {
    return authenticatedAny(req, async () => {
        const fetchResult = await fetchInventory(params.name);
        if (fetchResult.error)
            return fetchResult.error;
        return NextResponse.json(fetchResult.success);
    }, [Permission.VIEW_INVENTORY, Permission.MUTATE_STOCK, Permission.CREATE_INVENTORY]);
}

export type UpdateInventoryDto = {
    name: string,
}

export async function PATCH(req: Request, { params }: RouteContext) {
    return authenticated(req, async () => {
        const fetchResult = await fetchInventory(params.name);
        if (fetchResult.error)
            return fetchResult.error;

        const body: UpdateInventoryDto = await req.json();
        if (!body.name)
            return respond({
                message: "Malformed body!",
                init: {
                    status: 400
                }
            });

        const validatedName = generateValidInventoryName(body.name);
        if (validatedName.error)
            return validatedName.error;

        const validName = validatedName.success!;

        const updatedInventory = await prisma.inventory.update({
            where: {
                name: params.name.toLowerCase()
            },
            data: {
                name: validName
            }
        });

        return NextResponse.json(updatedInventory);
    }, Permission.CREATE_INVENTORY);
}

export async function DELETE(req: Request, { params }: RouteContext) {
    return authenticated(req, async () => {
        const fetchResult = await fetchInventory(params.name);
        if (fetchResult.error)
            return fetchResult.error;

        const deletedInventory = await prisma.inventory.delete({
            where: {
                name: params.name
            }
        });

        return NextResponse.json(deletedInventory);
    }, Permission.CREATE_INVENTORY);
}