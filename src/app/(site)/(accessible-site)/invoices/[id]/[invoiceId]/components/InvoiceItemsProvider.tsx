"use client";

import React, { useEffect, useReducer } from "react";
import { useInvoice } from "./InvoiceProvider";
import { InvoiceItem } from "@prisma/client";
import { UpdateInvoiceItemDto } from "../../../../../../api/invoices/customer/[id]/invoice/[invoiceId]/[itemId]/route";
import { InvoiceWithOptionalItems } from "../../../../home/_components/widgets/invoice/InvoiceWidget";
import { KeyedMutator } from "swr";

export enum InvoiceItemChangeAction {
    UPDATE,
    CLEAR,
    SET,
    REMOVE,
    REMOVE_MANY
}

const InvoiceItemsContext = React.createContext<{
    state: InvoiceItem[],
    dispatch: React.Dispatch<{
        type: InvoiceItemChangeAction,
        payload?: { id: string } & UpdateInvoiceItemDto | InvoiceItem[] | string[]
    }>,
    mutate: KeyedMutator<InvoiceWithOptionalItems | undefined>
} | undefined>(undefined);

const reducer = (state: InvoiceItem[], action: {
    type: InvoiceItemChangeAction,
    payload?: { id: string } & UpdateInvoiceItemDto | InvoiceItem[] | string[]
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
            newState = action.payload as InvoiceItem[];
            break;
        }
        case InvoiceItemChangeAction.REMOVE: {
            if (typeof action.payload !== "object")
                throw new Error("The payload must be an object when removing an item!");

            const index = state.findIndex(item => item.id === (action.payload as {
                id: string
            })?.id);

            newState.splice(index);
            break;
        }
        case InvoiceItemChangeAction.REMOVE_MANY: {
            if (!Array.isArray(action.payload))
                throw new Error("The payload must be an array when removing many items!");

            newState = newState.filter(item => !(action.payload as string[]).includes(item.id));
            break;
        }
    }

    return newState;
};

export function InvoiceItemsProvider({ children }: React.PropsWithChildren) {
    const { data: invoice, isLoading: invoiceIsLoading, mutate } = useInvoice();
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
            dispatch: dispatchItems,
            mutate
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