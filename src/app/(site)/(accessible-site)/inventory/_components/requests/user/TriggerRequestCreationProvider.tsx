"use client";

import React, { createContext, useContext } from "react";
import { CreateStockRequestDto } from "../../../../../../api/inventory/requests/me/route";
import axios, { AxiosResponse } from "axios";
import useSWRMutation, { SWRMutationResponse } from "swr/mutation";

type CreateNewRequestArgs = {
    arg: {
        dto: CreateStockRequestDto
    }
}

const CreateNewRequest = () => {
    const mutator = (url: string, { arg }: CreateNewRequestArgs) => axios.post(url, arg.dto);
    return useSWRMutation("/api/inventory/requests/me", mutator);
};


const TriggerRequestCreationContext = createContext<
    SWRMutationResponse<AxiosResponse<any>, any, "/api/inventory/requests/me", { dto: CreateStockRequestDto }>
    | undefined>(undefined);

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