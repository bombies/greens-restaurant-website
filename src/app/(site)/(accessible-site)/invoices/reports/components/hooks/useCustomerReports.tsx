"use client";

import { FetchCustomers } from "../../../components/InvoiceCustomerGrid";
import { useCallback, useEffect, useState } from "react";
import { Invoice, InvoiceCustomer, InvoiceItem } from "@prisma/client";

export type InvoiceCustomerWithInvoiceItems = InvoiceCustomer & {
    invoices: (Invoice & { invoiceItems: InvoiceItem[] })[]
}

export const useCustomerReports = () => {
    const { data: allCustomers, isLoading } = FetchCustomers();
    const [visibleCustomers, setVisibleCustomers] = useState<InvoiceCustomerWithInvoiceItems[]>();

    const setCustomers = useCallback((names: string[]) => {
        if (!allCustomers)
            return;

        if (!names || !names.length) {
            setVisibleCustomers(allCustomers);
            return;
        }

        console.log('names', names)
        setVisibleCustomers(allCustomers.filter(customer => names.includes(customer.customerName.toLowerCase().replaceAll(" ", "_"))));
    }, [allCustomers]);

    useEffect(() => {
        if (!isLoading && allCustomers)
            setVisibleCustomers(allCustomers);
    }, [allCustomers, isLoading]);


    return { allCustomers, visibleCustomers, setCustomers, isLoading };
};