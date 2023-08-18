"use client";

import Title from "../../../../../../_components/text/Title";
import { Spacer } from "@nextui-org/react";
import { sendToast, useUserData } from "../../../../../../../utils/Hooks";
import { useRouter } from "next/navigation";
import { Fragment, useEffect, useState } from "react";
import { hasAnyPermission, Permission } from "../../../../../../../libs/types/permission";
import { FetchInvoiceCustomer } from "../../components/InvoiceCustomerLayout";
import InvoiceControlBar from "./control-bar/InvoiceControlBar";
import SubTitle from "../../../../../../_components/text/SubTitle";
import InvoiceTable, { invoiceColumns } from "./table/InvoiceTable";
import { Divider } from "@nextui-org/divider";
import { dollarFormat } from "../../../../../../../utils/GeneralUtils";
import { Spinner } from "@nextui-org/spinner";
import InvoicePaidStatus, { PaidStatus } from "./InvoicePaidStatus";
import TableSkeleton from "../../../../../../_components/skeletons/TableSkeleton";
import { useInvoice } from "./InvoiceProvider";
import { useInvoiceItems } from "./InvoiceItemsProvider";
import axios from "axios";
import useSWRMutation from "swr/mutation";
import { useInvoicePaymentStatus } from "./hooks/useInvoicePaymentStatus";
import { formatInvoiceNumber } from "../../../components/invoice-utils";

type Props = {
    customerId: string
}

type ChangePaidStatusArgs = {
    arg: {
        invoiceId: string,
        status: boolean
    }
}

const ChangePaidStatus = (customerId?: string) => {
    const mutator = (url: string, { arg }: ChangePaidStatusArgs) => axios.patch(url.replace("{invoice_id}", arg.invoiceId), {
        paid: arg.status
    });
    return useSWRMutation(`/api/invoices/customer/${customerId}/invoice/{invoice_id}`, mutator);
};

export default function InvoiceLayout({ customerId }: Props) {
    const { data: customer, isLoading: customerIsLoading } = FetchInvoiceCustomer(customerId);
    const { data: invoice, isLoading: invoiceIsLoading } = useInvoice();
    const { state: invoiceItems } = useInvoiceItems();
    const { data: userData, isLoading: userDataIsLoading } = useUserData([
        Permission.VIEW_INVOICES,
        Permission.CREATE_INVOICE
    ]);
    const { trigger: triggerStatusChange, isMutating: statusIsChanging } = ChangePaidStatus(customerId);
    const { selectedStatus, setSelectedStatus } = useInvoicePaymentStatus({ invoice, invoiceIsLoading });

    return (
        <div>
            <div className="flex tablet:flex-col gap-x-6">
                <Title className="self-center">Invoices -
                    <span className="text-primary capitalize">
                        {customerIsLoading ? "Unknown" : customer?.customerName}
                    </span>
                </Title>
                <div className="default-container max-w-[40%] min-w-[25%] tablet:max-w-full tablet:mt-6 p-6">
                    {
                        invoiceIsLoading ?
                            <div className="flex justify-center">
                                <Spinner size="lg" />
                            </div>
                            :
                            <>
                                <div className="flex gap-4">
                                    <SubTitle className="self-center capitalize break-words">
                                        Invoice #{formatInvoiceNumber(invoice?.number || 0)}
                                    </SubTitle>
                                    <InvoicePaidStatus
                                        selectedStatus={selectedStatus}
                                        statusIsChanging={statusIsChanging}
                                        onStatusChange={(status) => {
                                            triggerStatusChange({
                                                invoiceId: invoice?.id ?? "",
                                                status: status === PaidStatus.PAID
                                            })
                                                .then((res) => {
                                                    setSelectedStatus(status as PaidStatus);
                                                })
                                                .catch(e => {
                                                    console.error(e);
                                                    sendToast({
                                                        error: e,
                                                        description: "There was an error updating the paid status!"
                                                    });
                                                });
                                        }}
                                    />
                                </div>

                                <p className="text-neutral-500 max-w-fit break-words">{invoice?.description}</p>
                                <Divider className="my-3" />
                                {
                                    invoiceItems &&
                                    <Fragment>
                                        <p className="font-semibold">
                                            Grand Total: <span className="text-primary">{
                                            dollarFormat.format(Number(invoiceItems
                                                .map(item => item.quantity * item.price)
                                                .reduce((prev, acc) => prev + acc, 0)))
                                        }</span>
                                        </p>
                                        <p className="font-semibold">
                                            Total Items: <span className="text-primary">{
                                            invoiceItems
                                                .map(item => item.quantity)
                                                .reduce((prev, acc) => prev + acc, 0)
                                        }</span>
                                        </p>
                                    </Fragment>

                                }
                            </>
                    }
                </div>
            </div>
            {
                hasAnyPermission(
                    userData?.permissions,
                    [Permission.CREATE_INVOICE]
                )
                &&
                <Fragment>
                    <Spacer y={6} />
                    <InvoiceControlBar
                        customer={customer}
                        invoice={invoice}
                        invoiceItems={invoiceItems}
                        controlsEnabled={
                            hasAnyPermission(
                                userData?.permissions,
                                [Permission.CREATE_INVOICE]
                            )}
                    />
                </Fragment>
            }
            <Spacer y={6} />
            {
                invoiceIsLoading ?
                    <div className="!bg-neutral-950/50 border-1 border-white/20 rounded-2xl flex justify-center">
                        <TableSkeleton columns={invoiceColumns} />
                    </div>
                    :
                    <InvoiceTable
                        customerId={customer?.id}
                        mutationAllowed={!invoice?.paid ? hasAnyPermission(
                            userData?.permissions,
                            [Permission.CREATE_INVOICE]
                        ) : false}
                    />
            }

        </div>
    );
}