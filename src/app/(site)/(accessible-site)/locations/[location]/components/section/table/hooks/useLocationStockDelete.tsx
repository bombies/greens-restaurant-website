"use client";

import axios from "axios";
import useSWRMutation from "swr/mutation";

type DeleteLocationStockItemsArgs = {
    arg: {
        uids: string[]
    }
}

const DeleteStockItems = (locationName?: string, sectionId?: string) => {
    const mutator = (url: string, { arg }: DeleteLocationStockItemsArgs) => axios.delete(url.replaceAll("{uids}", arg.uids.toString()));
    return useSWRMutation(`/api/inventory/location/${locationName}/${sectionId}/stock?ids={uids}`, mutator);
};

const useLocationStockDelete = (locationName?: string, sectionId?: string) => {
    return DeleteStockItems(locationName, sectionId);
};

export default useLocationStockDelete;