"use client";

import { UpdateStockDto } from "../../../../../../../api/inventory/[name]/stock/[id]/route";
import axios from "axios";
import useSWRMutation from "swr/mutation";

type UpdateInventoryStockArgs = {
    arg: {
        stockUID: string,
        dto: UpdateStockDto
    }
}

const UpdateInventoryStock = (inventoryName?: string) => {
    const mutator = (url: string, { arg }: UpdateInventoryStockArgs) => axios.patch(url.replaceAll("{stock_uid}", arg.stockUID), arg.dto);
    return useSWRMutation(`/api/inventory/${inventoryName}/stock/{stock_uid}`, mutator);
};

const useInventoryStockUpdate = (inventoryName?: string) => {
    return UpdateInventoryStock(inventoryName);
};

export default useInventoryStockUpdate;