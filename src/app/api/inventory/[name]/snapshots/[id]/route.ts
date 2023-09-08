import { authenticatedAny, respond } from "../../../../../../utils/api/ApiUtils";
import { NextResponse } from "next/server";
import Permission from "../../../../../../libs/types/permission";
import prisma from "../../../../../../libs/prisma";

type RouteContext = {
    params: {
        id: string
    }
}

export function GET(req: Request, { params }: RouteContext) {
    return authenticatedAny(req, async () => {
        const snapshot = await prisma.inventorySnapshot.findFirst({
            where: {
                id: params.id
            },
            include: {
                stockSnapshots: true,
                inventory: true
            }
        });

        if (!snapshot)
            return respond({
                message: "Snapshot not found!",
                init: {
                    status: 404
                }
            });
        return NextResponse.json(snapshot);
    }, [Permission.VIEW_INVENTORY, Permission.MUTATE_STOCK, Permission.CREATE_INVENTORY]);
}