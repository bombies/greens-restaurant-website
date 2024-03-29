"use client";

import Title from "../../../../../../_components/text/Title";
import { Spacer } from "@nextui-org/react";
import { errorToast, useUserData } from "../../../../../../../utils/Hooks";
import { Fragment, useEffect } from "react";
import { hasAnyPermission, Permission } from "../../../../../../../libs/types/permission";
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
import axios, { AxiosError } from "axios";
import useSWRMutation from "swr/mutation";
import { useInvoicePaymentStatus } from "./hooks/useInvoicePaymentStatus";
import { formatInvoiceNumber } from "../../../utils/invoice-utils";
import { FetchInvoiceCustomer } from "../../../utils/invoice-client-utils";
import { notFound } from "next/navigation";
import { InvoiceType } from "@prisma/client";
import { invoiceTypeAsString } from "../../../utils";

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
    const {
        data: customer,
        isLoading: customerIsLoading,
        mutate,
        error: customerError
    } = FetchInvoiceCustomer(customerId);
    const { data: invoice, isLoading: invoiceIsLoading, mutate: mutateInvoice, error: invoiceError } = useInvoice();
    const { state: invoiceItems } = useInvoiceItems();
    const { data: userData } = useUserData([
        Permission.VIEW_INVOICES,
        Permission.CREATE_INVOICE
    ]);
    const { trigger: triggerStatusChange, isMutating: statusIsChanging } = ChangePaidStatus(customerId);
    const { selectedStatus, setSelectedStatus } = useInvoicePaymentStatus({ invoice, invoiceIsLoading });

    useEffect(() => {
        if ((!customerError || !(customerError instanceof AxiosError)) && (!invoiceError || (!(invoiceError instanceof AxiosError))))
            return;

        const customerStatus = (customerError as AxiosError | undefined)?.response?.status ?? undefined;
        const invoiceStatus = (invoiceError as AxiosError | undefined)?.response?.status ?? undefined;

        if (customerStatus === 404 || invoiceStatus === 404)
            notFound();
    }, [customerError, invoiceError]);

    const typeAsString = invoiceTypeAsString(invoice);

    return (
        <div>
            <div className="flex tablet:flex-col gap-x-6">
                <Title className="self-center">
                    {typeAsString} - <span
                    className="text-primary capitalize">{customerIsLoading ? "Unknown" : customer?.customerName}</span>
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
                                        {typeAsString} #{formatInvoiceNumber(invoice?.number || 0)}
                                    </SubTitle>
                                    {(!invoice?.type || invoice.type === InvoiceType.DEFAULT) && (
                                        <InvoicePaidStatus
                                            selectedStatus={selectedStatus}
                                            statusIsChanging={statusIsChanging}
                                            onStatusChange={(status) => {
                                                triggerStatusChange({
                                                    invoiceId: invoice?.id ?? "",
                                                    status: status === PaidStatus.PAID
                                                })
                                                    .then(() => {
                                                        setSelectedStatus(status as PaidStatus);
                                                    })
                                                    .catch(e => {
                                                        console.error(e);
                                                        errorToast(e, "There was an error updating the paid status!");
                                                    });
                                            }}
                                        />
                                    )}
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
                        mutateInvoice={mutateInvoice}
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
                    <Fragment>
                        <InvoiceTable
                            customer={customer}
                            mutator={mutate}
                            mutationAllowed={!invoice?.paid ? hasAnyPermission(
                                userData?.permissions,
                                [Permission.CREATE_INVOICE]
                            ) : false}
                        />
                    </Fragment>

            }

        </div>
    );
}