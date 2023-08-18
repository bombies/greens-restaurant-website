"use client";

import { FC, useEffect, useState } from "react";
import DropdownInput from "../../../../../../_components/inputs/DropdownInput";
import { InvoiceCustomerWithInvoiceItems } from "../hooks/useCustomerReports";
import { PaidStatus } from "../../../[id]/[invoiceId]/components/InvoicePaidStatus";

interface Props {
    customers?: InvoiceCustomerWithInvoiceItems[],
    visibleCustomers?: InvoiceCustomerWithInvoiceItems[],
    setCustomers: (names: string[]) => void,
    customersAreLoading: boolean
}

export const FilterCustomerInvoiceReportButton: FC<Props> = ({
                                                                 customers,
                                                                 visibleCustomers,
                                                                 setCustomers,
                                                                 customersAreLoading
                                                             }) => {
    const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

    useEffect(() => {
        setCustomers(selectedKeys);
    }, [selectedKeys, setCustomers]);

    return (
        <DropdownInput
            isLoading={customersAreLoading}
            disabled={customersAreLoading}
            selectionRequired={false}
            multiSelect
            variant="flat"
            label="Filter Customers"
            fallbackTriggerLabel="Filter Customers"
            labelPlacement="above"
            keys={customers?.map(customer => customer.customerName) ?? []}
            selectedKeys={selectedKeys}
            setSelectedKeys={(selection) => {
                const selectedKeys = Array.from(selection) as string[];
                setSelectedKeys(selectedKeys);
            }}
        />
    );
};