"use client";

import { StockWithOptionalExtras } from "@/app/api/inventory/[name]/types";
import { $deleteWithArgs } from "@/utils/swr-utils";
import useSWRMutation from "swr/mutation";

type DeleteStockItemsArgs = { ids: string }

const DeleteStockItems = (inventoryName?: string) => {
    return useSWRMutation(`/api/inventory/${inventoryName}/stock`, $deleteWithArgs<DeleteStockItemsArgs, StockWithOptionalExtras[]>());
};

const useInventoryStockDelete = (inventoryName?: string) => {
    return DeleteStockItems(inventoryName);
};

export default useInventoryStockDelete;