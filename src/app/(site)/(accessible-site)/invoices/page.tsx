"use client";

import Title from "../../../_components/text/Title";
import SubTitle from "../../../_components/text/SubTitle";
import { Spacer } from "@nextui-org/react";
import InvoiceControlBar from "./components/InvoiceControlBar";
import CompanyInvoiceCard from "./components/CompanyInvoiceCard";
import InvoiceCustomerGrid from "./components/InvoiceCustomerGrid";
import { hasAnyPermission, Permission } from "../../../../libs/types/permission";
import { useUserData } from "../../../../utils/Hooks";
import { Fragment, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function InvoicesPage() {
    const { data: userData, isLoading: userDataIsLoading } = useUserData();
    const router = useRouter();

    useEffect(() => {
        if (!userDataIsLoading &&
            (!userData || !hasAnyPermission(userData.permissions, [
                Permission.VIEW_INVOICES,
                Permission.CREATE_INVOICE
            ]))
        )
            router.replace("/home");
    }, [router, userData, userDataIsLoading]);

    return (
        <div>
            <Title>Invoices</Title>
            <SubTitle>Create, delete and edit your invoices and invoice recipients</SubTitle>
            {
                hasAnyPermission(
                    userData?.permissions,
                    [Permission.CREATE_INVOICE]
                ) &&
                <Fragment>
                    <Spacer y={6} />
                    <InvoiceControlBar
                        controlsEnabled={
                            hasAnyPermission(
                                userData?.permissions,
                                [Permission.CREATE_INVOICE]
                            )}
                    />
                </Fragment>
            }
            <Spacer y={6} />
            <div className="flex gap-6 tablet:flex-col">
                <InvoiceCustomerGrid />
                <CompanyInvoiceCard controlsEnabled={hasAnyPermission(
                    userData?.permissions,
                    [Permission.CREATE_INVOICE]
                )} />
            </div>
        </div>
    );
}