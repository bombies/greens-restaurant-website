import { authenticatedAny } from "../../../../../../utils/api/ApiUtils";
import Permission from "../../../../../../libs/types/permission";
import { NextResponse } from "next/server";
import { StockType } from "@prisma/client";
import inventoryService from "../../service";

type RouteContext = {
    params: {
        name: string
    }
}

export type StockSnapshotPostDto = {
    name: string,
    type?: StockType,
    price?: number
}

export async function POST(req: Request, { params }: RouteContext) {
    return authenticatedAny(req, async (_) => {
        const createdStockSnapshot = await inventoryService.createStockSnapshot(params.name, await req.json());
        if (createdStockSnapshot.error)
            return createdStockSnapshot.error;
        return NextResponse.json(createdStockSnapshot.success);
    }, [Permission.CREATE_INVENTORY, Permission.MUTATE_STOCK]);
}