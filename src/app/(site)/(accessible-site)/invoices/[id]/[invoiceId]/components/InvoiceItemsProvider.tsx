"use client";

import React, { useEffect, useReducer, useState } from "react";
import { useInvoice } from "./InvoiceProvider";
import { InvoiceItem } from "@prisma/client";
import { UpdateInvoiceItemDto } from "../../../../../../api/invoices/customer/[id]/invoice/[invoiceId]/[itemId]/route";

export enum InvoiceItemChangeAction {
    UPDATE,
    CLEAR,
    SET
}

const InvoiceItemsContext = React.createContext<{
    state: InvoiceItem[],
    dispatch: React.Dispatch<{
        type: InvoiceItemChangeAction,
        payload?: { id: string } & UpdateInvoiceItemDto | InvoiceItem[]
    }>
} | undefined>(undefined);

const reducer = (state: InvoiceItem[], action: {
    type: InvoiceItemChangeAction,
    payload?: { id: string } & UpdateInvoiceItemDto | InvoiceItem[]
}) => {
    if (!action)
        return [];

    let newState: InvoiceItem[] = !state ? [] : [...state];

    switch (action.type) {
        case InvoiceItemChangeAction.UPDATE: {
            if (typeof action.payload !== "object")
                throw new Error("The payload must be an object when setting new items!");

            const index = state.findIndex(item => item.id === (action.payload as {
                id: string
            } & UpdateInvoiceItemDto)?.id);
            newState[index] = {
                ...newState[index],
                ...action.payload
            };
            break;
        }
        case InvoiceItemChangeAction.CLEAR: {
            newState = [];
            break;
        }
        case InvoiceItemChangeAction.SET: {
            if (!Array.isArray(action.payload))
                throw new Error("The payload must be an array when setting new items!");
            newState = action.payload;
            break;
        }
    }

    return newState;
};

export function InvoiceItemsProvider({ children }: React.PropsWithChildren) {
    const { data: invoice, isLoading: invoiceIsLoading } = useInvoice();
    const [items, dispatchItems] = useReducer(reducer, invoice?.invoiceItems!);

    useEffect(() => {
        if (!invoiceIsLoading && invoice) {
            dispatchItems({
                type: InvoiceItemChangeAction.SET,
                payload: invoice.invoiceItems
            });
        }
    }, [invoice, invoiceIsLoading]);

    return (
        <InvoiceItemsContext.Provider value={{
            state: items,
            dispatch: dispatchItems
        }}>
            {children}
        </InvoiceItemsContext.Provider>
    );
}

export function useInvoiceItems() {
    const context = React.useContext(InvoiceItemsContext);
    if (!context)
        throw new Error("useInvoiceItems can only be used within a InvoiceItemsProvider!");
    return context;
}