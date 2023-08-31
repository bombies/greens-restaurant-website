"use client";

import Title from "../../../_components/text/Title";
import SubTitle from "../../../_components/text/SubTitle";
import { Spacer } from "@nextui-org/react";
import InvoiceControlBar from "./components/control-bar/InvoiceControlBar";
import CompanyInvoiceCard from "./components/CompanyInvoiceCard";
import InvoiceCustomerGrid from "./components/InvoiceCustomerGrid";
import { hasAnyPermission, Permission } from "../../../../libs/types/permission";
import { useUserData } from "../../../../utils/Hooks";
import { Fragment } from "react";
import { useInvoiceCustomers } from "./components/hooks/useInvoiceCustomers";

export default function InvoicesPage() {
    const { data: userData } = useUserData([
        Permission.VIEW_INVOICES,
        Permission.CREATE_INVOICE
    ]);
    const invoiceCustomerHook = useInvoiceCustomers();

    return (
        <div>
            <Title>Invoices</Title>
            <SubTitle>Create, delete and edit your invoices and invoice recipients</SubTitle>
            {
                hasAnyPermission(
                    userData?.permissions,
                    [Permission.CREATE_INVOICE, Permission.VIEW_INVOICES]
                ) &&
                <Fragment>
                    <Spacer y={6} />
                    <InvoiceControlBar
                        customers={invoiceCustomerHook.customers}
                        mutateData={invoiceCustomerHook.mutate}
                        mutationAllowed={
                            hasAnyPermission(
                                userData?.permissions,
                                [Permission.CREATE_INVOICE]
                            )}
                        fetchingAllowed={hasAnyPermission(
                            userData?.permissions,
                            [Permission.CREATE_INVOICE, Permission.VIEW_INVOICES]
                        )}
                    />
                </Fragment>
            }
            <Spacer y={6} />
            <div className="flex gap-6 tablet:flex-col">
                <InvoiceCustomerGrid {...invoiceCustomerHook} />
                <CompanyInvoiceCard controlsEnabled={hasAnyPermission(
                    userData?.permissions,
                    [Permission.CREATE_INVOICE]
                )} />
            </div>
        </div>
    );
}