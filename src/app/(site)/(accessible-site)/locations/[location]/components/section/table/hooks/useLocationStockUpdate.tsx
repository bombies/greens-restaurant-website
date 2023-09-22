"use client";

import axios from "axios";
import useSWRMutation from "swr/mutation";
import {
    UpdateLocationSectionStockDto
} from "../../../../../../../../api/inventory/location/[name]/[sectionId]/stock/[stockUID]/route";

type UpdateLocationStockArgs = {
    arg: {
        stockUID: string,
        dto: UpdateLocationSectionStockDto
    }
}

const UpdateLocationStock = (locationName?: string, sectionId?: string) => {
    const mutator = (url: string, { arg }: UpdateLocationStockArgs) => axios.patch(url.replaceAll("{stock_uid}", arg.stockUID), arg.dto);
    return useSWRMutation(`/api/inventory/location/${locationName}/${sectionId}/stock/{stock_uid}`, mutator);
};

const useLocationStockUpdate = (locationName?: string, sectionId?: string) => {
    return UpdateLocationStock(locationName, sectionId);
};

export default useLocationStockUpdate;