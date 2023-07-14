"use client";

import useSWR from "swr";
import { fetcher } from "../../../employees/_components/EmployeeGrid";
import { Invoice, InvoiceCustomer } from "@prisma/client";
import Title from "../../../../../_components/text/Title";
import { Spacer } from "@nextui-org/react";
import InvoiceCustomerControlBar from "./control-bar/InvoiceCustomerControlBar";
import { useUserData } from "../../../../../../utils/Hooks";
import { useRouter } from "next/navigation";
import { Fragment, useEffect } from "react";
import { hasAnyPermission, Permission } from "../../../../../../libs/types/permission";
import InvoiceGrid from "./InvoiceGrid";

type Props = {
    id: string,
}

export const FetchInvoiceCustomer = (id: string) => {
    return useSWR(`/api/invoices/customer/${id}/invoices`, fetcher<InvoiceCustomer & {
        invoices: Invoice[]
    }>);
};

export default function InvoiceCustomerLayout({ id }: Props) {
    const { data: customer, isLoading: customerIsLoading } = FetchInvoiceCustomer(id);
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
            <Title>Invoices - <span
                className="text-primary capitalize">{customerIsLoading ? "Unknown" : customer?.customerName}</span>
            </Title>
            <Spacer y={6} />
            {
                hasAnyPermission(
                    userData?.permissions,
                    [Permission.CREATE_INVOICE]
                )
                &&
                <Fragment>
                    <InvoiceCustomerControlBar
                        customer={customer}
                        controlsEnabled={
                            hasAnyPermission(
                                userData?.permissions,
                                [Permission.CREATE_INVOICE]
                            )}
                    />
                    <Spacer y={6} />
                </Fragment>
            }
            <InvoiceGrid
                customerIsLoading={customerIsLoading}
                customer={customer}
            />
        </div>
    );
}