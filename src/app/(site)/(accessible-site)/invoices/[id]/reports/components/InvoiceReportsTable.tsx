"use client";

import React, { FC, Key, useCallback, useMemo, useState } from "react";
import { Invoice, InvoiceItem } from "@prisma/client";
import GenericTable from "../../../../../../_components/table/GenericTable";
import { Column } from "../../[invoiceId]/components/table/InvoiceTable";
import { SortDescriptor, TableCell, TableRow } from "@nextui-org/react";
import { Spinner } from "@nextui-org/spinner";
import {
    formatDateDDMMYYYY,
    formatInvoiceNumber,
    generateInvoiceTotal,
    invoiceIsOverdue
} from "../../../utils/invoice-utils";
import { Chip } from "@nextui-org/chip";
import { dollarFormat } from "../../../../../../../utils/GeneralUtils";
import SubTitle from "../../../../../../_components/text/SubTitle";
import { InvoiceWithOptionalItems } from "../../../../home/_components/widgets/invoice/InvoiceWidget";

interface Props {
    invoices?: InvoiceWithOptionalItems[]
    customerIsLoading: boolean,
}

const columns: Column[] = [
    {
        key: "invoice_number",
        value: "Number"
    },
    {
        key: "invoice_desc",
        value: "Description"
    },
    {
        key: "invoice_date",
        value: "Date Created"
    },
    {
        key: "invoice_total",
        value: "Total"
    },
    {
        key: "invoice_status",
        value: "Status"
    }
];

export const InvoiceReportsTable: FC<Props> = ({ invoices, customerIsLoading }) => {
    const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>();

    const getKeyValue = useCallback((invoice: InvoiceWithOptionalItems, key: Key) => {
        switch (key) {
            case "invoice_number": {
                return formatInvoiceNumber(invoice.number);
            }
            case "invoice_desc": {
                return invoice.description;
            }
            case "invoice_date": {
                return formatDateDDMMYYYY(new Date(invoice.createdAt.toString()));
            }
            case "invoice_total": {
                return dollarFormat.format(generateInvoiceTotal(invoice));
            }
            case "invoice_status": {
                return <Chip
                    variant="flat"
                    color={invoice.paid ? "success" : "danger"}
                    classNames={{
                        content: "font-semibold"
                    }}
                >
                    {invoice.paid ? "PAID" : (!invoiceIsOverdue(invoice) ? "UNPAID" : "OVERDUE")}
                </Chip>;
            }
        }
    }, []);


    const sortedItems = useMemo(() => {
        return invoices?.sort((a, b) => {
            if (!sortDescriptor)
                return 0;

            let cmp: number;
            switch (sortDescriptor.column) {
                case "invoice_number": {
                    cmp = a.number - b.number;
                    break;
                }
                case "invoice_date": {
                    cmp = new Date(a.createdAt) < new Date(b.createdAt) ? -1 : 1;
                    break;
                }
                case "invoice_total": {
                    cmp = generateInvoiceTotal(a) > generateInvoiceTotal(b) ? 1 : -1;
                    break;
                }
                default: {
                    cmp = 0;
                    break;
                }
            }

            if (sortDescriptor.direction === "descending")
                cmp *= -1;

            return cmp;

        });
    }, [invoices, sortDescriptor]);

    return (
        <div className="!bg-neutral-950/50 border-1 border-white/20 rounded-2xl">
            <GenericTable
                columns={columns}
                items={sortedItems ?? []}
                sortableColumns={["invoice_number", "invoice_date", "invoice_total"]}
                emptyContent={!customerIsLoading ? "There are no invoices." : undefined}
                isLoading={customerIsLoading}
                sortDescriptor={sortDescriptor}
                onSortChange={setSortDescriptor}
                loadingContent={
                    <Spinner size="lg" />
                }
                bottomContent={
                    <div className="flex default-container p-6 gap-6 phone:justify-center phone:gap-1 justify-end">
                        <SubTitle className="self-center text-lg phone:text-sm" thick>TOTAL</SubTitle>
                        <p className="self-center px-6 phone:px-1 py-4 text-primary font-semibold text-xl phone:text-lg">{dollarFormat.format(sortedItems ? sortedItems.reduce((prev, invoice) => prev + generateInvoiceTotal(invoice), 0) : 0)}</p>
                    </div>
                }
            >
                {(invoice) => (
                    <TableRow>
                        {(colKey) => <TableCell>{getKeyValue(invoice, colKey)}</TableCell>}
                    </TableRow>
                )}
            </GenericTable>
        </div>
    );
};