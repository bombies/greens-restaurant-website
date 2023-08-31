"use client";

import { InvoiceItem } from "@prisma/client";
import { Fragment, Key, useCallback, useMemo, useState } from "react";
import AddInvoiceItemButton from "./AddInvoiceItemButton";
import {
    Selection,
    SortDescriptor,
    Spacer,
    TableCell,
    TableRow
} from "@nextui-org/react";
import clsx from "clsx";
import { dollarFormat } from "../../../../../../../../utils/GeneralUtils";
import SlidingBar from "../../../../../../../_components/SlidingBar";
import GenericButton from "../../../../../../../_components/inputs/GenericButton";
import EditInvoiceItemButton from "./EditInvoiceItemButton";
import { useInvoice } from "../InvoiceProvider";
import { useInvoiceItems } from "../InvoiceItemsProvider";
import DeleteInvoiceItemButton from "./DeleteInvoiceItemButton";
import DeleteInvoiceItemsButton from "./DeleteInvoiceItemsButton";
import closeIcon from "/public/icons/close-gold-circled.svg";
import GenericTable from "../../../../../../../_components/table/GenericTable";
import { InvoiceCustomerWithOptionalItems } from "../../../../../home/_components/widgets/invoice/InvoiceWidget";
import { KeyedMutator } from "swr";


export type Column = {
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
    customer?: InvoiceCustomerWithOptionalItems,
    mutator: KeyedMutator<InvoiceCustomerWithOptionalItems | undefined>,
    mutationAllowed: boolean
}

export default function InvoiceTable({ customer, mutationAllowed }: Props) {
    const { data: invoice, isLoading } = useInvoice();
    const { state: items, dispatch: dispatchItems, mutate: mutateItems } = useInvoiceItems();
    const [selectedKeys, setSelectedKeys] = useState<Key[]>([]);
    const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>();

    const getKeyValue = useCallback((invoice: InvoiceItem, key: Key) => {
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

    const sortedItems = useMemo(() => {
        return items?.sort((a, b) => {
            if (!sortDescriptor)
                return 0;

            let cmp: number;
            switch (sortDescriptor.column) {
                case "invoice_item": {
                    cmp = a.name.localeCompare(b.name);
                    break;
                }
                case "invoice_quantity": {
                    cmp = a.quantity < b.quantity ? -1 : 1;
                    break;
                }
                case "invoice_price_per": {
                    cmp = a.price < b.price ? -1 : 1;
                    break;
                }
                case "invoice_total": {
                    cmp = (a.quantity * a.price) < (b.quantity * b.price) ? -1 : 1;
                    break;
                }
                default: {
                    cmp = 0;
                    break;
                }
            }

            if (sortDescriptor.direction === "descending") {
                cmp *= -1;
            }

            return cmp;
        }) ?? [];
    }, [items, sortDescriptor]);

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
                                icon={closeIcon}
                            >
                                Clear Selection
                            </GenericButton>
                            <DeleteInvoiceItemsButton
                                disabled={!mutationAllowed}
                                customerId={customer?.id}
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
                                                customerId={customer?.id}
                                                item={items.find(item => item.id === selectedKeys[0].toString().split("/")[0])!}
                                                dispatchItems={dispatchItems}
                                                setSelectedKeys={setSelectedKeys}
                                            />
                                            <GenericButton
                                                disabled={!mutationAllowed}
                                                variant="flat"
                                                color="warning"
                                                onPress={() => setSelectedKeys([])}
                                                icon={closeIcon}
                                            >
                                                Clear Selection
                                            </GenericButton>
                                            <DeleteInvoiceItemButton
                                                disabled={!mutationAllowed}
                                                customerId={customer?.id}
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
                <GenericTable
                    selectionMode={mutationAllowed ? "multiple" : "none"}
                    columns={invoiceColumns}
                    items={sortedItems}
                    sortableColumns={["invoice_item", "invoice_quantity", "invoice_price_per", "invoice_total"]}
                    emptyContent={`There are no items.${mutationAllowed ? " Click on the button below to add an item." : ""}`}
                    aria-label="Invoice Table"
                    sortDescriptor={sortDescriptor}
                    onSortChange={setSortDescriptor}
                    selectedKeys={selectedKeys}
                    onSelectionChange={(keys: Selection) => {
                        if (keys === "all")
                            setSelectedKeys(sortedItems.map(item => `${item.id}/${item.name}`));
                        else setSelectedKeys(Array.from(keys));
                    }}
                >
                    {(item) => (
                        <TableRow key={`${item.id}/${item.name}`}>
                            {(columnKey: Key) => <TableCell
                                className={clsx(columnKey !== "invoice_desc" && "capitalize")}>{getKeyValue(item, columnKey)}</TableCell>}
                        </TableRow>
                    )}
                </GenericTable>
                {
                    mutationAllowed &&
                    <Fragment>
                        <Spacer y={3} />
                        <div className="p-6">
                            <AddInvoiceItemButton
                                disabled={!mutationAllowed}
                                invoice={invoice}
                                customer={customer}
                                items={items}
                                mutator={mutateItems}
                            />
                        </div>
                    </Fragment>
                }
            </div>
        </>
    );
}