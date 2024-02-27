"use client";

import React from "react";
import { SWRResponse } from "swr";
import { InvoiceWithOptionalItems } from "../../../../home/_components/widgets/InvoiceWidget";
import { FetchInvoice } from "../../../utils/invoice-client-utils";

const InvoiceContext = React.createContext<SWRResponse<InvoiceWithOptionalItems | undefined> | undefined>(undefined);

type Props = {
    customerId: string,
    invoiceId: string,
} & React.PropsWithChildren

export function InvoiceProvider({ customerId, invoiceId, children }: Props) {
    return (
        <InvoiceContext.Provider value={FetchInvoice(customerId, invoiceId, true)}>
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