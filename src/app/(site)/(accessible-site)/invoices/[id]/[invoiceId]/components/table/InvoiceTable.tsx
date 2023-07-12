"use client";

import { Invoice, InvoiceItem, Prisma } from "@prisma/client";
import { Spacer, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@nextui-org/react";
import { useCallback, useState } from "react";
import AddInvoiceItemButton from "./AddInvoiceItemButton";
import { dollarFormat } from "../../../../../../../../utils/GeneralUtils";
import clsx from "clsx";

type Column = {
    key: string,
    value: string,
}

export const columns: Column[] = [
    {
        key: "invoice_item",
        value: "Item"
    },
    {
        key: "invoice_desc",
        value: "Description"
    },
    {
        key: "invoice_quantity",
        value: "Quantity"
    },
    {
        key: "invoice_price_per",
        value: "Price Per Item"
    },
    {
        key: "invoice_total",
        value: "Total"
    }
];

type Props = {
    customerId?: string,
    invoice?: Invoice & { invoiceItems: InvoiceItem[] },
    mutationAllowed: boolean
}

export default function InvoiceTable({ customerId, invoice, mutationAllowed }: Props) {
    const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>(invoice?.invoiceItems ?? []);

    const getKeyValue = useCallback((invoice: InvoiceItem, key: Prisma.Key) => {
        switch (key) {
            case "invoice_item": {
                return invoice.name;
            }
            case "invoice_desc": {
                return invoice.description;
            }
            case "invoice_quantity": {
                return dollarFormat.format(invoice.quantity);
            }
            case "invoice_price_per": {
                return dollarFormat.format(invoice.price);
            }
            case "invoice_total": {
                return dollarFormat.format(invoice.price * invoice.quantity);
            }
        }
    }, []);

    return (
        <div className="!bg-neutral-950/50 border-1 border-white/20 rounded-2xl">
            <Table
                isStriped={true}
                className="!bg-neutral-950/0"
                aria-label="Invoice Table"
            >
                <TableHeader columns={columns}>
                    {column => <TableColumn key={column.key}>{column.value}</TableColumn>}
                </TableHeader>
                <TableBody items={invoice?.invoiceItems ?? []}>
                    {item => (
                        <TableRow key={item.id}>
                            {columnKey => <TableCell
                                className={clsx(columnKey !== "invoice_desc" && "capitalize")}>{getKeyValue(item, columnKey)}</TableCell>}
                        </TableRow>
                    )}
                </TableBody>
            </Table>
            <Spacer y={3} />
            <div className="p-6">
                <AddInvoiceItemButton
                    disabled={!mutationAllowed}
                    invoiceId={invoice?.id}
                    customerId={customerId}
                />
            </div>
        </div>

    );
}