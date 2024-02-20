"use client";

import { useEffect, useReducer, useState } from "react";
import { invoiceIsOverdue } from "../../../../utils/invoice-utils";
import { Invoice, InvoiceCustomer, InvoiceItem } from "@prisma/client";
import {
    InvoiceCustomerWithOptionalItems,
    InvoiceWithOptionalItems
} from "../../../../../home/_components/widgets/invoice/InvoiceWidget";

export type ReportParamsState = {
    dateFrom?: Date,
    dateTo?: Date,
    status?: "paid" | "unpaid" | "overdue" | null
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

type Params = {
    customer?: InvoiceCustomerWithOptionalItems,
    customerIsLoading: boolean,
}

export const useInvoiceReport = ({ customer, customerIsLoading }: Params) => {
    const [visibleInvoices, setVisibleInvoices] = useState<InvoiceWithOptionalItems[]>();
    const [reportParams, dispatchReportParams] = useReducer(reducer, {
        dateFrom: undefined,
        dateTo: undefined,
        status: undefined
    });

    useEffect(() => {
        if (!customerIsLoading && customer)
            setVisibleInvoices(customer.invoices);
    }, [customer, customerIsLoading]);

    useEffect(() => {
        if (customer)
            setVisibleInvoices(
                customer.invoices
                    ?.filter(invoice => {
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
                                case "overdue": {
                                    return invoiceIsOverdue(invoice);
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

    return { reportParams, visibleInvoices, dispatchReportParams };
};