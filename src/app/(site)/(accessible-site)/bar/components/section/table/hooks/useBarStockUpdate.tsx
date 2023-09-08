"use client";

import axios from "axios";
import useSWRMutation from "swr/mutation";
import {
    UpdateBarSectionStockDto
} from "../../../../../../../api/inventory/bar/[name]/[sectionId]/stock/[stockUID]/route";

type UpdateBarStockArgs = {
    arg: {
        stockUID: string,
        dto: UpdateBarSectionStockDto
    }
}

const UpdateBarStock = (barName?: string, sectionId?: string) => {
    const mutator = (url: string, { arg }: UpdateBarStockArgs) => axios.patch(url.replaceAll("{stock_uid}", arg.stockUID), arg.dto);
    return useSWRMutation(`/api/inventory/bar/${barName}/${sectionId}/stock/{stock_uid}`, mutator);
};

const useBarStockUpdate = (barName?: string, sectionId?: string) => {
    return UpdateBarStock(barName, sectionId);
};

export default useBarStockUpdate;