"use client";

import React, { useContext } from "react";
import useSWR, { SWRResponse } from "swr";
import { Invoice, InvoiceItem } from "@prisma/client";
import { fetcher } from "../../../../employees/_components/EmployeeGrid";

const InvoiceContext = React.createContext<SWRResponse<(Invoice & {
    invoiceItems: InvoiceItem[]
}) | undefined> | undefined>(undefined);

type Props = {
    customerId: string,
    invoiceId: string,
} & React.PropsWithChildren

const FetchInvoice = (customerId: string, invoiceId: string) => {
    return useSWR(`/api/invoices/customer/${customerId}/invoice/${invoiceId}`, fetcher<Invoice & {
        invoiceItems: InvoiceItem[]
    }>);
};

export function InvoiceProvider({ customerId, invoiceId, children }: Props) {
    return (
        <InvoiceContext.Provider value={FetchInvoice(customerId, invoiceId)}>
            {children}
        </InvoiceContext.Provider>
    );
}

export function useInvoice() {
    const context = React.useContext(InvoiceContext);
    if (!context)
        throw new Error("useInvoice must be used within an InvoiceProvider");
    return context;
}