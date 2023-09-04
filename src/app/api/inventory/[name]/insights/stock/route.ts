import { authenticatedAny } from "../../../../../../utils/api/ApiUtils";
import Permission from "../../../../../../libs/types/permission";
import prisma from "../../../../../../libs/prisma";
import inventoryService from "../../service";
import { NextResponse } from "next/server";

type RouteContext = {
    params: {
        name: string
    }
}

export type StockTimeSeries = {
    name: string,
    data: TimeSeriesData[]
}

type TimeSeriesData = {
    date: Date,
    value: number,
}

export async function GET(req: Request, { params }: RouteContext) {
    return authenticatedAny(req, async () => {
        const inventory = await inventoryService.fetchInventory(params.name);
        if (inventory.error)
            return inventory.error;

        const stock = await prisma.stock.findMany({
            where: {
                inventoryId: inventory.success!.id
            }
        });

        const stockSnapshots = await prisma.stockSnapshot.findMany({
            where: {
                inventorySnapshot: {
                    inventoryId: inventory.success!.id
                }
            }
        });

        const data: StockTimeSeries[] = stock.map(item => {
            const itemSnapshots = stockSnapshots.filter(snapshotItem => snapshotItem.uid === item.uid);
            const timeData: TimeSeriesData[] = itemSnapshots.map(snapshot => ({
                date: new Date(snapshot.createdAt.setHours(0, 0, 0, 0)),
                value: snapshot.quantity
            }));

            return ({
                name: item.name,
                data: timeData
            });
        });

        return NextResponse.json(data);
    }, [Permission.VIEW_INVENTORY, Permission.MUTATE_STOCK, Permission.CREATE_INVENTORY]);
}