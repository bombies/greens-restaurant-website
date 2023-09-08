import { authenticatedAny } from "../../../../../../utils/api/ApiUtils";
import Permission from "../../../../../../libs/types/permission";
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

export type TimeSeriesData = {
    date: Date,
    value: number,
}

export async function GET(req: Request, { params }: RouteContext) {
    return authenticatedAny(req, async () => {
        const data = await inventoryService.fetchInsightsData(params.name);
        return data.error ?? NextResponse.json(data.success!);
    }, [Permission.VIEW_INVENTORY, Permission.MUTATE_STOCK, Permission.CREATE_INVENTORY]);
}