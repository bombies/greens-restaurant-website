import React, { FC, Key, useCallback } from "react";
import GenericTable from "../../../../../_components/table/GenericTable";
import { Column } from "../../[id]/[invoiceId]/components/table/InvoiceTable";
import { Button, Link, TableCell, TableRow, Tooltip } from "@nextui-org/react";
import { Spinner } from "@nextui-org/spinner";
import { generateInvoicesTotal, generateInvoiceTotal, invoiceIsOverdue } from "../../utils/invoice-utils";
import { dollarFormat } from "../../../../../../utils/GeneralUtils";
import EyeIcon from "../../../../../_components/icons/EyeIcon";
import SubTitle from "../../../../../_components/text/SubTitle";
import { InvoiceCustomerWithOptionalItems } from "../../../home/_components/widgets/invoice/InvoiceWidget";
import { InvoiceType } from "@prisma/client";

const columns: Column[] = [
    { key: "customer_name", value: "Customer Name" },
    { key: "total_invoiced", value: "Total Invoiced" },
    { key: "total_paid", value: "Total Paid" },
    { key: "total_outstanding", value: "Total Outstanding" },
    // { key: "invoice_count", value: "Invoice Count" },
    // { key: "paid_invoice_count", value: "Paid Invoice Count" },
    // { key: "unpaid_invoice_count", value: "Unpaid Invoice Count" },
    // { key: "overdue_invoice_count", value: "Overdue Invoice Count" },
    { key: "actions", value: "Actions" }
];

interface Props {
    customers?: InvoiceCustomerWithOptionalItems[],
    customersAreLoading: boolean
}

export const CustomerInvoiceReportTable: FC<Props> = ({ customers, customersAreLoading }) => {
    const getKeyValue = useCallback((customer: InvoiceCustomerWithOptionalItems, key: Key) => {
        switch (key) {
            case "customer_name": {
                return customer.customerName;
            }
            case "total_invoiced": {
                return dollarFormat.format(
                    customer.invoices
                        ?.filter(invoice => !invoice.type || invoice.type === InvoiceType.DEFAULT)
                        ?.reduce((prev, invoice) =>
                            prev + generateInvoiceTotal(invoice), 0) ?? 0
                );
            }
            case "total_paid": {
                return dollarFormat.format(
                    customer.invoices
                        ?.filter(invoice => (!invoice.type || invoice.type === InvoiceType.DEFAULT) && invoice.paid)
                        .reduce((prev, invoice) =>
                            prev + generateInvoiceTotal(invoice), 0) ?? 0
                );
            }
            case "total_outstanding": {
                return dollarFormat.format(
                    customer.invoices
                        ?.filter(invoice => (!invoice.type || invoice.type === InvoiceType.DEFAULT) && !invoice.paid)
                        .reduce((prev, invoice) =>
                            prev + generateInvoiceTotal(invoice), 0) ?? 0
                );
            }
            case "invoice_count": {
                return customer.invoices?.length;
            }
            case "paid_invoice_count": {
                return customer.invoices?.filter(invoice =>  (!invoice.type || invoice.type === InvoiceType.DEFAULT) && invoice.paid).length;
            }
            case "unpaid_invoice_count": {
                return customer.invoices?.filter(invoice => (!invoice.type || invoice.type === InvoiceType.DEFAULT) && !invoice.paid).length;
            }
            case "overdue_invoice_count": {
                return customer.invoices?.filter(invoice => (!invoice.type || invoice.type === InvoiceType.DEFAULT) && invoiceIsOverdue(invoice)).length;
            }
            case "actions": {
                return (
                    <Tooltip content="View Full Report">
                        <Button
                            as={Link}
                            href={`/invoices/${customer.id}/reports`}
                            variant="flat"
                            color="primary"
                            isIconOnly
                        >
                            <EyeIcon fill="#00D615" width={16} />
                        </Button>
                    </Tooltip>
                );
            }
        }
    }, []);

    return (
        <div className="!bg-neutral-950/50 border-1 border-white/20 rounded-2xl">
            <GenericTable
                columns={columns}
                items={customers ?? []}
                emptyContent={!customersAreLoading ? "There are no items." : undefined}
                isLoading={customersAreLoading}
                loadingContent={<Spinner size="lg" />}
                bottomContent={
                    <div
                        className="flex default-container p-6 phone:px-2 gap-6 phone:justify-center phone:gap-1 justify-end">
                        <div className="grid grid-cols-2 gap-x-6 phone:gap-x-1">
                            <SubTitle className="self-center text-lg phone:text-sm" thick>GRAND TOTAL</SubTitle>
                            <p className="self-center text-right px-6 phone:px-1 py-4 text-primary font-semibold text-xl phone:text-lg">
                                {dollarFormat.format(
                                    customers ?
                                        customers.reduce((prev, customer) => prev + generateInvoicesTotal(customer.invoices, true), 0)
                                        : 0
                                )}
                            </p>
                            <SubTitle className="self-center text-lg phone:text-sm" thick>TOTAL PAID</SubTitle>
                            <p className="self-center text-right px-6 phone:px-1 py-4 text-primary font-semibold text-xl phone:text-lg">
                                {dollarFormat.format(
                                    customers ?
                                        customers.reduce((prev, customer) => prev + generateInvoicesTotal(customer.invoices?.filter(invoice => invoice.paid), true), 0)
                                        : 0
                                )}
                            </p>
                            <SubTitle className="self-center text-lg phone:text-sm" thick>TOTAL OUTSTANDING</SubTitle>
                            <p className="self-center text-right px-6 phone:px-1 py-4 text-primary font-semibold text-xl phone:text-lg">
                                {dollarFormat.format(
                                    customers ?
                                        customers.reduce((prev, customer) => prev + generateInvoicesTotal(customer.invoices?.filter(invoice => !invoice.paid), true), 0)
                                        : 0
                                )}
                            </p>
                        </div>
                    </div>
                }
            >
                {customer => (
                    <TableRow>
                        {(colKey) => <TableCell>{getKeyValue(customer, colKey)}</TableCell>}
                    </TableRow>
                )}
            </GenericTable>
        </div>
    );
};