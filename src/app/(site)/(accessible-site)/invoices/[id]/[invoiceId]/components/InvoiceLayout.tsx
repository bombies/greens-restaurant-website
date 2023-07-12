"use client";

import Title from "../../../../../../_components/text/Title";
import { Spacer } from "@nextui-org/react";
import { useUserData } from "../../../../../../../utils/Hooks";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { hasAnyPermission, Permission } from "../../../../../../../libs/types/permission";
import { FetchInvoiceCustomer } from "../../components/InvoiceCustomerLayout";
import InvoiceControlBar from "./control-bar/InvoiceControlBar";
import useSWR from "swr";
import { fetcher } from "../../../../employees/_components/EmployeeGrid";
import { Invoice, InvoiceItem } from "@prisma/client";
import SubTitle from "../../../../../../_components/text/SubTitle";
import InvoiceTable from "./table/InvoiceTable";
import { Divider } from "@nextui-org/divider";
import { dollarFormat } from "../../../../../../../utils/GeneralUtils";
import { Spinner } from "@nextui-org/spinner";

type Props = {
    customerId: string,
    invoiceId: string
}

const FetchInvoice = (customerId: string, invoiceId: string) => {
    return useSWR(`/api/invoices/customer/${customerId}/invoice/${invoiceId}`, fetcher<Invoice & {
        invoiceItems: InvoiceItem[]
    }>);
};

export default function InvoiceLayout({ customerId, invoiceId }: Props) {
    const { data: customer, isLoading: customerIsLoading } = FetchInvoiceCustomer(customerId);
    const { data: invoice, isLoading: invoiceIsLoading } = FetchInvoice(customerId, invoiceId);
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
            <div className="flex tablet:flex-col gap-x-6">
                <Title className="self-center">Invoices -
                    <span className="text-primary capitalize">
                        {customerIsLoading ? "Unknown" : customer?.customerName}
                    </span>
                </Title>
                <div className="default-container max-w-[40%] min-w-[25%] tablet:w-full tablet:mt-6 p-6">
                    {
                        invoiceIsLoading ?
                            <div className="flex justify-center">
                                <Spinner size="lg" />
                            </div>
                            :
                            <>
                                <SubTitle className="self-center capitalize break-words">
                                    {invoice?.title}
                                </SubTitle>
                                <p className="text-neutral-500 max-w-fit break-words">{invoice?.description}</p>
                                <Divider className="my-3" />
                                {
                                    invoice &&
                                    <p className="font-semibold">
                                        Total: <span className="text-primary">{
                                        dollarFormat.format(Number(invoice.invoiceItems
                                            .map(item => item.quantity * item.price)
                                            .reduce((prev, acc) => prev + acc, 0)))
                                    }</span>
                                    </p>
                                }
                            </>
                    }
                </div>
            </div>
            <Spacer y={6} />
            <InvoiceControlBar
                customer={customer}
                invoice={invoice}
                controlsEnabled={
                    hasAnyPermission(
                        userData?.permissions,
                        [Permission.CREATE_INVOICE]
                    )}
            />
            <Spacer y={6} />
            <InvoiceTable
                customerId={customer?.id}
                invoice={invoice}
                mutationAllowed={hasAnyPermission(
                    userData?.permissions,
                    [Permission.CREATE_INVOICE]
                )}
            />
        </div>
    );
}