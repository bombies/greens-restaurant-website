"use client";

import { useUserData } from "../../../../../../../utils/Hooks";
import { FetchInvoiceCustomer } from "../../components/InvoiceCustomerLayout";
import { useRouter } from "next/navigation";
import { Fragment, useEffect, useReducer, useState } from "react";
import { hasAnyPermission, Permission } from "../../../../../../../libs/types/permission";
import Title from "../../../../../../_components/text/Title";
import { InvoiceCustomerInformation } from "../../components/InvoiceCustomerInformation";
import { Spacer } from "@nextui-org/react";
import { InvoiceReportsControlBar } from "./control-bar/InvoiceReportsControlBar";
import { InvoiceReportsTable } from "./InvoiceReportsTable";
import { Invoice, InvoiceItem } from "@prisma/client";

type Props = {
    id: string
}

export type ReportParamsState = {
    dateFrom?: Date | null,
    dateTo?: Date | null,
    status?: "paid" | "unpaid" | null
}

export enum ReportParamsActionType {
    SET
}

const reducer = (state: ReportParamsState, action: {
    type: ReportParamsActionType,
    payload: Partial<ReportParamsState>
}) => {
    let newState = { ...state };

    switch (action.type) {
        case ReportParamsActionType.SET: {
            newState = {
                dateFrom: action.payload.dateFrom === null ? undefined : (action.payload.dateFrom === undefined ? newState.dateFrom : action.payload.dateFrom),
                dateTo: action.payload.dateTo === null ? undefined : (action.payload.dateTo === undefined ? newState.dateTo : action.payload.dateTo),
                status: action.payload.status === null ? undefined : (action.payload.status === undefined ? newState.status : action.payload.status)
            };
            break;
        }
    }

    return newState;
};

export default function InvoiceReportsContext({ id }: Props) {
    const { data: customer, isLoading: customerIsLoading } = FetchInvoiceCustomer(id);
    const { data: userData, isLoading: userDataIsLoading } = useUserData();
    const [visibleInvoices, setVisibleInvoices] = useState<(Invoice & { invoiceItems: InvoiceItem[] })[]>();
    const [reportParams, dispatchReportParams] = useReducer(reducer, {
        dateFrom: undefined,
        dateTo: undefined,
        status: undefined
    });

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

    useEffect(() => {
        if (!customerIsLoading && customer)
            setVisibleInvoices(customer.invoices);
    }, [customer, customerIsLoading]);

    useEffect(() => {
        if (customer)
            setVisibleInvoices(
                customer.invoices
                    .filter(invoice => {
                        const statusPredicate = () => {
                            if (!reportParams.status)
                                return true;
                            switch (reportParams.status) {
                                case "paid": {
                                    return invoice.paid === true;
                                }
                                case "unpaid": {
                                    return invoice.paid !== true;
                                }
                            }
                        };

                        const dateFromPredicate = () => {
                            if (!reportParams.dateFrom)
                                return true;

                            return new Date(invoice.createdAt) >= reportParams.dateFrom;
                        };

                        const dateToPredicate = () => {
                            if (!reportParams.dateTo)
                                return true;

                            return new Date(invoice.createdAt) <= reportParams.dateTo;
                        };

                        return dateFromPredicate() && dateToPredicate() && statusPredicate();
                    })
            );
    }, [customer, reportParams]);

    return (
        <div>
            <div className="flex tablet:flex-col gap-12 tablet:gap-6">
                <Title className="self-center">Invoices - <span
                    className="text-primary capitalize">{customerIsLoading ? "Unknown" : customer?.customerName}</span>
                </Title>
                <InvoiceCustomerInformation id={id} />
            </div>
            <Spacer y={6} />
            {
                hasAnyPermission(
                    userData?.permissions,
                    [Permission.CREATE_INVOICE]
                )
                &&
                <Fragment>
                    <InvoiceReportsControlBar
                        id={id}
                        customerName={customer?.customerName ?? "Unknown"}
                        currentItems={visibleInvoices ?? []}
                        reportParams={reportParams}
                        dispatchReportParams={dispatchReportParams}
                    />
                    <Spacer y={6} />
                    <InvoiceReportsTable
                        invoices={visibleInvoices}
                        customerIsLoading={customerIsLoading}
                    />
                </Fragment>
            }
        </div>
    );
}