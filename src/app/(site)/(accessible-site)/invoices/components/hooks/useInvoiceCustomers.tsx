"use client";

import { useEffect, useState } from "react";
import { FetchInvoiceCustomers } from "../../utils/invoice-client-utils";
import { InvoiceCustomerWithOptionalItems } from "../../../home/_components/widgets/invoice/InvoiceWidget";

export const useInvoiceCustomers = (withInvoices?: boolean, withItems?: boolean) => {
    const { data: customers, isLoading } = FetchInvoiceCustomers({ withInvoices, withItems });
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

    return { visibleCustomers, customers, isLoading, search, setSearch };
};