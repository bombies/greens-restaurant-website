"use client";

import { Invoice, InvoiceItem } from "@prisma/client";
import { Spacer, Table, TableBody, TableColumn, TableHeader } from "@nextui-org/react";
import IconButton from "../../../../../../_components/inputs/IconButton";
import addIcon from "/public/icons/add.svg";

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
                <TableBody items={undefined}>
                </TableBody>
            </Table>
            <Spacer y={12} />
            <div className="p-6">
                <IconButton variant="shadow" toolTip="New Item" icon={addIcon} />
            </div>
        </div>

    );
}