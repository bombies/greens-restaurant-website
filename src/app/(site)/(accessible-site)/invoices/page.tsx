"use client";

import Title from "../../../_components/text/Title";
import SubTitle from "../../../_components/text/SubTitle";
import { Spacer } from "@nextui-org/react";
import InvoiceControlBar from "./components/InvoiceControlBar";
import CompanyInvoiceCard from "../inventory/_components/CompanyInvoiceCard";
import InvoiceCustomerGrid from "../inventory/_components/InvoiceCustomerGrid";
import { hasAnyPermission, Permission } from "../../../../libs/types/permission";
import { useUserData } from "../../../../utils/Hooks";
import { useEffect } from "react";
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
            <Spacer y={6} />
            <InvoiceControlBar
                controlsEnabled={
                    hasAnyPermission(
                        userData?.permissions,
                        [Permission.CREATE_INVOICE]
                    )}
            />
            <Spacer y={6} />
            <div className="flex gap-6 tablet:flex-col">
                <InvoiceCustomerGrid />
                <CompanyInvoiceCard />
            </div>
        </div>
    );
}