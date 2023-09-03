"use client";

import axios from "axios";
import useSWRMutation from "swr/mutation";

type DeleteStockItemsArgs = {
    arg: {
        uids: string[]
    }
}

const DeleteStockItems = (barName?: string, sectionId?: string) => {
    const mutator = (url: string, { arg }: DeleteStockItemsArgs) => axios.delete(url.replaceAll("{uids}", arg.uids.toString()));
    return useSWRMutation(`/api/inventory/bar/${barName}/${sectionId}/stock?ids={uids}`, mutator);
};

const useBarStockDelete = (barName?: string, sectionId?: string) => {
    return DeleteStockItems(barName, sectionId);
};

export default useBarStockDelete;