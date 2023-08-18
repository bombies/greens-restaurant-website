"use client";

import { Fragment } from "react";
import Title from "../../../../_components/text/Title";
import SubTitle from "../../../../_components/text/SubTitle";
import { Spacer } from "@nextui-org/react";
import { CustomerInvoiceReportsControlBar } from "./components/control-bar/CustomerInvoiceReportsControlBar";
import { useUserData } from "../../../../../utils/Hooks";
import Permission from "../../../../../libs/types/permission";
import { CustomerInvoiceReportTable } from "./components/CustomerInvoiceReportTable";
import { useCustomerReports } from "./components/hooks/useCustomerReports";

export default function CustomerInvoiceReportsPage() {
    const {
        allCustomers,
        visibleCustomers: customers,
        setCustomers,
        isLoading: customersAreLoading
    } = useCustomerReports();
    useUserData([Permission.VIEW_INVOICES, Permission.CREATE_INVOICE]);

    return (
        <Fragment>
            <Title>Invoice Reports</Title>
            <SubTitle>Generate reports for invoices</SubTitle>
            <Spacer y={6} />
            <CustomerInvoiceReportsControlBar
                customers={customers}
                allCustomers={allCustomers}
                setCustomers={setCustomers}
                customersAreLoading={customersAreLoading}
            />
            <Spacer y={6} />
            <CustomerInvoiceReportTable
                customers={customers}
                customersAreLoading={customersAreLoading}
            />
        </Fragment>
    );
}