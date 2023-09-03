"use client";

import axios from "axios";
import useSWRMutation from "swr/mutation";

type DeleteStockItemsArgs = {
    arg: {
        uids: string[]
    }
}

const DeleteStockItems = (inventoryName?: string) => {
    const mutator = (url: string, { arg }: DeleteStockItemsArgs) => axios.delete(url.replaceAll("{uids}", arg.uids.toString()));
    return useSWRMutation(`/api/inventory/${inventoryName}/stock`, mutator);
};

const useInventoryStockDelete = (inventoryName?: string) => {
    return DeleteStockItems(inventoryName);
};

export default useInventoryStockDelete;