import { authenticatedAny, respondWithInit } from "../../../../utils/api/ApiUtils";
import Permission from "../../../../libs/types/permission";
import prisma from "../../../../libs/prisma";
import { InventoryType } from ".prisma/client";
import { NextResponse } from "next/server";
import inventoryService from "../[name]/service";
import { CreateLocationDto, createLocationDtoSchema } from "./types";

export async function GET(req: Request) {
    return authenticatedAny(req, async (session) => {
        const locationInventories = await prisma.inventory.findMany({
            where: {
                type: InventoryType.LOCATION
            },
            include: {
                inventorySections: {
                    include: {
                        assignedStock: true
                    }
                }
            }
        });

        return NextResponse.json(locationInventories);
    }, [
        Permission.CREATE_INVENTORY,
        Permission.VIEW_LOCATIONS,
        Permission.MUTATE_LOCATIONS
    ]);
}

export async function POST(req: Request) {
    return authenticatedAny(req, async (session) => {
        const body: CreateLocationDto = await req.json();
        const bodyValidated = createLocationDtoSchema.safeParse(body);
        if (!bodyValidated.success)
            return respondWithInit({
                validationErrors: bodyValidated,
                message: "Invalid body!",
                status: 400
            });

        const location = await inventoryService.createInventory({
            ...body,
            type: InventoryType.LOCATION
        }, session);
        return location.error ?? NextResponse.json(location.success!);
    }, [
        Permission.CREATE_INVENTORY,
        Permission.MUTATE_LOCATIONS
    ]);
}