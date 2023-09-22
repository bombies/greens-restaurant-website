import { authenticatedAny } from "../../../../../../utils/api/ApiUtils";
import inventoryService from "../../../[name]/service";
import { NextResponse } from "next/server";
import Permission from "../../../../../../libs/types/permission";

export async function GET(req: Request) {
    return authenticatedAny(req, async () => {
        const data = await inventoryService.fetchInsightsData("bar");
        return data.error ?? NextResponse.json(data.success!);
    }, [Permission.VIEW_INVENTORY, Permission.MUTATE_STOCK, Permission.CREATE_INVENTORY]);
}