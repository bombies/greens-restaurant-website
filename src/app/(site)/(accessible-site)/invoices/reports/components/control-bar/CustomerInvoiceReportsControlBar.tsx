"use client";

import { FC } from "react";
import { FilterCustomerInvoiceReportButton } from "./FilterCustomerInvoiceReportButton";
import { InvoiceCustomerWithInvoiceItems } from "../hooks/useCustomerReports";
import { GoBackButton } from "../../../[id]/components/control-bar/InvoiceCustomerControlBar";
import { Divider } from "@nextui-org/divider";

interface Props {
    customers?: InvoiceCustomerWithInvoiceItems[],
    allCustomers?: InvoiceCustomerWithInvoiceItems[],
    setCustomers: (ids: string[]) => void,
    customersAreLoading: boolean
}

export const CustomerInvoiceReportsControlBar: FC<Props> = ({
                                                                customers,
                                                                allCustomers,
                                                                setCustomers,
                                                                customersAreLoading
                                                            }) => {
    return (
        <div className="default-container p-12 ">
            <GoBackButton label="View All Customers" href="/invoices" />
            <Divider className="my-6" />
            <div className="grid grid-cols-4 phone:grid-cols-1">
                <FilterCustomerInvoiceReportButton
                    setCustomers={setCustomers}
                    customers={allCustomers}
                    visibleCustomers={customers}
                    customersAreLoading={customersAreLoading}
                />
            </div>
        </div>
    );
};