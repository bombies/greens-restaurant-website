"use client";

import React, { Fragment, useMemo } from "react";
import { Spinner } from "@nextui-org/spinner";
import SubTitle from "../../../../../_components/text/SubTitle";
import { Divider } from "@nextui-org/divider";
import { dollarFormat } from "../../../../../../utils/GeneralUtils";
import { generateInvoiceTotal } from "../../utils/invoice-utils";
import { FetchInvoiceCustomer } from "../../utils/invoice-client-utils";
import { InvoiceType } from "@prisma/client";

interface Props {
    id: string;
}

export const InvoiceCustomerInformation: React.FC<Props> = ({ id }) => {
    const { data: customer, isLoading: customerIsLoading } = FetchInvoiceCustomer(id, true, true);

    const invoiceTotal = useMemo(() => (
        Number(customer?.invoices
            ?.filter(invoice => !invoice.type || invoice.type === InvoiceType.DEFAULT)
            ?.map(invoice => generateInvoiceTotal(invoice))
            .reduce((prev, acc) => prev + acc, 0)
        )
    ), [customer?.invoices]);

    const invoicePaidTotal = useMemo(() => (
        Number(customer?.invoices
            ?.filter(invoice => (!invoice.type || invoice.type === InvoiceType.DEFAULT) && invoice.paid)
            .map(invoice => generateInvoiceTotal(invoice))
            .reduce((prev, acc) => prev + acc, 0)
        )
    ), [customer?.invoices]);

    const invoiceUnpaidTotal = useMemo(() => (
        Number(customer?.invoices
            ?.filter(invoice => (!invoice.type || invoice.type === InvoiceType.DEFAULT) && !invoice.paid)
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