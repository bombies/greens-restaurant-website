"use client";

import React, { createContext, useContext } from "react";
import useSWRMutation, { SWRMutationResponse } from "swr/mutation";
import { CreateStockRequestDto, StockRequestWithOptionalExtras } from "../../../../../../api/inventory/requests/types";
import { $post } from "@/utils/swr-utils";

const CreateNewRequest = () => {
    return useSWRMutation("/api/inventory/requests/me", $post<CreateStockRequestDto, StockRequestWithOptionalExtras>());
};


const TriggerRequestCreationContext = createContext<SWRMutationResponse<StockRequestWithOptionalExtras | undefined, any, "/api/inventory/requests/me", {
    body: CreateStockRequestDto;
}> | undefined>(undefined);

export default function TriggerRequestCreationProvider({ children }: React.PropsWithChildren) {
    return (
        <TriggerRequestCreationContext.Provider value={CreateNewRequest()}>
            {children}
        </TriggerRequestCreationContext.Provider>
    );
}

export const useRequestCreationTrigger = () => {
    const context = useContext(TriggerRequestCreationContext);
    if (!context)
        throw new Error("useRequestCreationTrigger must be used under a TriggerRequestCreationProvider!");
    return context;
};