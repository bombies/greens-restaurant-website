"use client";

import React, { Fragment, useMemo } from "react";
import { FetchInvoiceCustomer } from "./InvoiceCustomerLayout";
import { Spinner } from "@nextui-org/spinner";
import SubTitle from "../../../../../_components/text/SubTitle";
import { Divider } from "@nextui-org/divider";
import { dollarFormat } from "../../../../../../utils/GeneralUtils";
import { generateInvoiceTotal } from "../../components/invoice-utils";

interface Props {
    id: string;
}

export const InvoiceCustomerInformation: React.FC<Props> = ({ id }) => {
    const { data: customer, isLoading: customerIsLoading } = FetchInvoiceCustomer(id);

    const invoiceTotal = useMemo(() => (
        Number(customer?.invoices
            .map(invoice => generateInvoiceTotal(invoice))
            .reduce((prev, acc) => prev + acc, 0)
        )
    ), [customer?.invoices]);

    const invoicePaidTotal = useMemo(() => (
        Number(customer?.invoices
            .filter(invoice => invoice.paid)
            .map(invoice => generateInvoiceTotal(invoice))
            .reduce((prev, acc) => prev + acc, 0)
        )
    ), [customer?.invoices]);

    const invoiceUnpaidTotal = useMemo(() => (
        Number(customer?.invoices
            .filter(invoice => !invoice.paid)
            .map(invoice => generateInvoiceTotal(invoice))
            .reduce((prev, acc) => prev + acc, 0)
        )
    ), [customer?.invoices]);

    return (
        <div className="default-container max-w-[40%] min-w-[25%] tablet:max-w-full tablet:mt-6 p-6">
            {
                customerIsLoading ?
                    <Spinner size="lg" />
                    :
                    <Fragment>
                        <SubTitle className="self-center capitalize break-words">
                            Customer Totals
                        </SubTitle>
                        <Divider className="my-4" />
                        <p className="font-semibold">
                            Grand Total: <span className="text-primary">{
                            dollarFormat.format(invoiceTotal)
                        }</span>
                        </p>
                        <p className="font-semibold">
                            Paid Total: <span className="text-primary">{
                            dollarFormat.format(invoicePaidTotal)
                        }</span>
                        </p>
                        <p className="font-semibold">
                            Outstanding Total: <span className="text-primary">{
                            dollarFormat.format(invoiceUnpaidTotal)
                        }</span>
                        </p>
                    </Fragment>
            }
        </div>
    );
};