"use client";

import { FC, Key, useCallback, useMemo, useState } from "react";
import { Invoice, InvoiceItem } from "@prisma/client";
import GenericTable from "../../../../../../_components/table/GenericTable";
import { Column } from "../../[invoiceId]/components/table/InvoiceTable";
import { SortDescriptor, TableCell, TableRow } from "@nextui-org/react";
import { Spinner } from "@nextui-org/spinner";
import { formatDateDDMMYYYY, generateInvoiceTotal } from "../../../components/invoice-utils";
import { Chip } from "@nextui-org/chip";
import { dollarFormat } from "../../../../../../../utils/GeneralUtils";

interface Props {
    invoices?: (Invoice & { invoiceItems: InvoiceItem[] })[]
    customerIsLoading: boolean,
}

const columns: Column[] = [
    {
        key: "invoice_title",
        value: "Title"
    },
    {
        key: "invoice_desc",
        value: "Description"
    },
    {
        key: "invoice_date",
        value: "Date"
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

    const getKeyValue = useCallback((invoice: (Invoice & { invoiceItems: InvoiceItem[] }), key: Key) => {
        switch (key) {
            case "invoice_title": {
                return invoice.title;
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
                return invoice.paid ?
                    <Chip color="success" variant="flat">PAID</Chip>
                    :
                    <Chip color="danger" variant="flat">UNPAID</Chip>;
            }
        }
    }, []);


    const sortedItems = useMemo(() => {
        return invoices?.sort((a, b) => {
            if (!sortDescriptor)
                return 0;

            let cmp: number;
            switch (sortDescriptor.column) {
                case "invoice_title": {
                    cmp = a.title.localeCompare(b.title);
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
                sortableColumns={["invoice_title", "invoice_date", "invoice_total"]}
                emptyContent={!customerIsLoading ? "There are no invoices." : "Loading invoices..."}
                isLoading={customerIsLoading}
                sortDescriptor={sortDescriptor}
                onSortChange={setSortDescriptor}
                loadingContent={
                    <Spinner size="lg" />
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