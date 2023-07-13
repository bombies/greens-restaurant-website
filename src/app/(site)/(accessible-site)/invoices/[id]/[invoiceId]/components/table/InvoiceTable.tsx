"use client";

import { Invoice, InvoiceItem, Prisma } from "@prisma/client";
import { Fragment, Key, useCallback, useState } from "react";
import AddInvoiceItemButton from "./AddInvoiceItemButton";
import { Spacer, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@nextui-org/react";
import clsx from "clsx";
import { dollarFormat } from "../../../../../../../../utils/GeneralUtils";
import SlidingBar from "../../../../../../../_components/SlidingBar";
import GenericButton from "../../../../../../../_components/inputs/GenericButton";
import EditInvoiceItemButton from "./EditInvoiceItemButton";
import { useInvoice } from "../InvoiceProvider";
import { useInvoiceItems } from "../InvoiceItemsProvider";
import DeleteInvoiceItemButton from "./DeleteInvoiceItemButton";
import DeleteInvoiceItemsButton from "./DeleteInvoiceItemsButton";

type Column = {
    key: string,
    value: string,
}

export const invoiceColumns: Column[] = [
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
    mutationAllowed: boolean
}

export default function InvoiceTable({ customerId, mutationAllowed }: Props) {
    const { data: invoice } = useInvoice();
    const { state: items, dispatch: dispatchItems } = useInvoiceItems();
    const [selectedKeys, setSelectedKeys] = useState<Key[]>([]);

    const getKeyValue = useCallback((invoice: InvoiceItem, key: Prisma.Key) => {
        switch (key) {
            case "invoice_item": {
                return invoice.name;
            }
            case "invoice_desc": {
                return invoice.description;
            }
            case "invoice_quantity": {
                return invoice.quantity;
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
        <>
            <SlidingBar visible={!!selectedKeys.length && mutationAllowed}>
                {
                    selectedKeys.length > 1 ?
                        <div className="flex phone:flex-col gap-12 phone:gap-2">
                            <p className="self-center">You have multiple items selected</p>
                            <GenericButton
                                disabled={!mutationAllowed}
                                variant="flat"
                                color="warning"
                                onPress={() => setSelectedKeys([])}
                            >
                                Clear Selection
                            </GenericButton>
                            <DeleteInvoiceItemsButton
                                disabled={!mutationAllowed}
                                customerId={customerId}
                                items={items.filter(item => selectedKeys
                                    .map(key => key.toString().split("/")[0])
                                    .includes(item.id)
                                )}
                                dispatchItems={dispatchItems}
                                setSelectedKeys={setSelectedKeys}
                            />
                        </div>
                        :
                        (selectedKeys.length === 1 ?
                                <div>
                                    <p className="text-left self-center">You have selected <span
                                        className="capitalize font-semibold text-primary">{selectedKeys[0].toString().split("/")[1]}</span>
                                    </p>
                                    <div className="flex phone:flex-col gap-12 phone:gap-2">
                                        <p className="self-center">What would you like to do?</p>
                                        <div className="flex phone:flex-col gap-4 phone:gap-2">
                                            <EditInvoiceItemButton
                                                disabled={!mutationAllowed}
                                                customerId={customerId}
                                                item={items.find(item => item.id === selectedKeys[0].toString().split("/")[0])!}
                                                dispatchItems={dispatchItems}
                                                setSelectedKeys={setSelectedKeys}
                                            />
                                            <GenericButton
                                                disabled={!mutationAllowed}
                                                variant="flat"
                                                color="warning"
                                                onPress={() => setSelectedKeys([])}
                                            >
                                                Clear Selection
                                            </GenericButton>
                                            <DeleteInvoiceItemButton
                                                disabled={!mutationAllowed}
                                                customerId={customerId}
                                                item={items.find(item => item.id === selectedKeys[0].toString().split("/")[0])!}
                                                dispatchItems={dispatchItems}
                                                setSelectedKeys={setSelectedKeys}
                                            />
                                        </div>
                                    </div>
                                </div>
                                :
                                <></>
                        )

                }
            </SlidingBar>
            <div className="!bg-neutral-950/50 border-1 border-white/20 rounded-2xl">
                <Table
                    color="primary"
                    selectionMode={mutationAllowed ? "multiple" : "none"}
                    selectedKeys={selectedKeys}
                    onSelectionChange={(keys) => {
                        setSelectedKeys(Array.from(keys));
                    }}
                    className="!bg-neutral-950/0"
                    aria-label="Invoice Table"
                >
                    <TableHeader columns={invoiceColumns}>
                        {(column: Column) => <TableColumn key={column.key}>{column.value}</TableColumn>}
                    </TableHeader>
                    <TableBody
                        items={items ?? []}
                        emptyContent="There are no items. Click on the button below to add an item."
                    >
                        {(item: InvoiceItem) => (
                            <TableRow key={`${item.id}/${item.name}`}>
                                {columnKey => <TableCell
                                    className={clsx(columnKey !== "invoice_desc" && "capitalize")}>{getKeyValue(item, columnKey)}</TableCell>}
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
                {
                    mutationAllowed &&
                    <Fragment>
                        <Spacer y={3} />
                        <div className="p-6">
                            <AddInvoiceItemButton
                                disabled={!mutationAllowed}
                                invoiceId={invoice?.id}
                                customerId={customerId}
                            />
                        </div>
                    </Fragment>
                }
            </div>
        </>
    );
}