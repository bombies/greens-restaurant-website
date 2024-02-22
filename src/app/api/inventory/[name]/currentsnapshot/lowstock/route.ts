import { ApiRoute, buildResponse } from "@/app/api/utils/utils";
import { authenticatedAny } from "@/utils/api/ApiUtils";
import inventoryService from "../../service";
import { StockSnapshot } from "@prisma/client";
import configService from "@/app/api/config/service";
import { itemHasLowStock } from "@/app/(site)/(accessible-site)/inventory/utils/inventory-utils";
import Permission from "@/libs/types/permission";

export const GET: ApiRoute<{ name: string }> = (req, { params: { name } }) =>
    authenticatedAny(req, async () => {
        const fetchedSnapshot = await inventoryService.fetchCurrentSnapshot(name);
        if (fetchedSnapshot.error)
            return fetchedSnapshot.error;

        const items = fetchedSnapshot.success!.stockSnapshots
        const config = await configService.getConfig()
        const lowStockItems: StockSnapshot[] = []

        items?.forEach((item) => {
            if (itemHasLowStock(config, item))
                lowStockItems.push(item)
        })

        return buildResponse({
            data: lowStockItems
        })
    }, [Permission.VIEW_INVENTORY, Permission.MUTATE_STOCK, Permission.CREATE_INVENTORY])