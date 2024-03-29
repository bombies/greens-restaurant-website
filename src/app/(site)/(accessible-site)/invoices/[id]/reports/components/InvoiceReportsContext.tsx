"use client";

import { useUserData } from "../../../../../../../utils/Hooks";
import { Fragment } from "react";
import { hasAnyPermission, Permission } from "../../../../../../../libs/types/permission";
import Title from "../../../../../../_components/text/Title";
import { InvoiceCustomerInformation } from "../../components/InvoiceCustomerInformation";
import { Spacer } from "@nextui-org/react";
import { InvoiceReportsControlBar } from "./control-bar/InvoiceReportsControlBar";
import { InvoiceReportsTable } from "./InvoiceReportsTable";
import { useInvoiceReport } from "./hooks/useInvoiceReport";
import { FetchInvoiceCustomer } from "../../../utils/invoice-client-utils";

type Props = {
    id: string
}

export default function InvoiceReportsContext({ id }: Props) {
    const { data: customer, isLoading: customerIsLoading } = FetchInvoiceCustomer(id, true, true);
    const {
        data: userData
    } = useUserData([Permission.VIEW_INVOICES, Permission.CREATE_INVOICE]);
    const { reportParams, dispatchReportParams, visibleInvoices } = useInvoiceReport({ customer, customerIsLoading });

    return (
        <div>
            <div className="flex tablet:flex-col gap-12 tablet:gap-6">
                <Title className="self-center">Documents - <span
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