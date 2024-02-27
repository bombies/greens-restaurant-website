"use client";

import { useCallback, useEffect, useState } from "react";
import { FetchInvoiceCustomers } from "../../../utils/invoice-client-utils";
import { InvoiceCustomerWithOptionalItems } from "../../../../home/_components/widgets/InvoiceWidget";

export const useCustomerReports = () => {
    const { data: allCustomers, isLoading } = FetchInvoiceCustomers({
        withInvoices: true,
        withItems: true
    });
    const [visibleCustomers, setVisibleCustomers] = useState<InvoiceCustomerWithOptionalItems[]>();

    const setCustomers = useCallback((names: string[]) => {
        if (!allCustomers)
            return;

        if (!names || !names.length) {
            setVisibleCustomers(allCustomers);
            return;
        }

        setVisibleCustomers(allCustomers.filter(customer => names.includes(customer.customerName.toLowerCase().replaceAll(" ", "_"))));
    }, [allCustomers]);

    useEffect(() => {
        if (!isLoading && allCustomers)
            setVisibleCustomers(allCustomers);
    }, [allCustomers, isLoading]);


    return { allCustomers, visibleCustomers, setCustomers, isLoading };
};