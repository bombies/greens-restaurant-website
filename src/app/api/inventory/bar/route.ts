import { authenticatedAny } from "../../../../utils/api/ApiUtils";
import Permission from "../../../../libs/types/permission";
import prisma from "../../../../libs/prisma";
import { InventoryType } from ".prisma/client";
import { NextResponse } from "next/server";
import { v4 } from "uuid";

export async function GET(req: Request) {
    return authenticatedAny(req, async (session) => {
        const barInventory = await prisma.inventory.findFirst({
            where: {
                type: InventoryType.BAR,
                name: "bar"
            },
            include: {
                inventorySections: {
                    include: {
                        assignedStock: true
                    }
                }
            }
        });

        return NextResponse.json(barInventory ?? await prisma.inventory.create({
            data: {
                name: `bar`,
                type: InventoryType.BAR,
                uid: v4(),
                createdByUserId: session.user!.id
            }
        }));
    }, [
        Permission.CREATE_INVENTORY,
        Permission.VIEW_BAR_INVENTORY,
        Permission.MUTATE_BAR_INVENTORY
    ]);
}