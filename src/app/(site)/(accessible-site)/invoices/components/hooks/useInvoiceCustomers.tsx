"use client";

import { FetchCustomers } from "../InvoiceCustomerGrid";
import { useEffect, useState } from "react";
import { InvoiceCustomerWithInvoiceItems } from "../../reports/components/hooks/useCustomerReports";

export const useInvoiceCustomers = () => {
    const { data: customers, isLoading } = FetchCustomers();
    const [visibleCustomers, setVisibleCustomers] = useState<InvoiceCustomerWithInvoiceItems[]>();
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