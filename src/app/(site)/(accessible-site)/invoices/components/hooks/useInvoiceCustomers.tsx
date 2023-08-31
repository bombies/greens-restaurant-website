"use client";

import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { FetchInvoiceCustomers } from "../../utils/invoice-client-utils";
import { InvoiceCustomerWithOptionalItems } from "../../../home/_components/widgets/invoice/InvoiceWidget";
import { KeyedMutator } from "swr";

export type InvoiceCustomerHook = {
    visibleCustomers?: InvoiceCustomerWithOptionalItems[],
    customers?: InvoiceCustomerWithOptionalItems[],
    isLoading: boolean,
    search?: string,
    setSearch: Dispatch<SetStateAction<string | undefined>>,
    mutate: KeyedMutator<InvoiceCustomerWithOptionalItems[] | undefined>
}

export const useInvoiceCustomers = (withInvoices?: boolean, withItems?: boolean): InvoiceCustomerHook => {
    const { data: customers, isLoading, mutate } = FetchInvoiceCustomers({ withInvoices, withItems });
    const [visibleCustomers, setVisibleCustomers] = useState<InvoiceCustomerWithOptionalItems[]>();
    const [search, setSearch] = useState<string>();

    useEffect(() => {
        if (!isLoading && customers)
            setVisibleCustomers(visibleCustomers);
    }, [customers, isLoading, visibleCustomers]);

    useEffect(() => {
        if (!customers)
            return;

        if (!search?.trim())
            setVisibleCustomers(customers);
        else setVisibleCustomers(customers.filter(customer => customer.customerName.toLowerCase().includes(search.toLowerCase().trim())));
    }, [customers, search]);

    return { visibleCustomers, customers, mutate, isLoading, search, setSearch };
};