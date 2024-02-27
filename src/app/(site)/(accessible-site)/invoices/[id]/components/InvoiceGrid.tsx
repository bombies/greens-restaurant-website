"use client";

import { Invoice } from "@prisma/client";
import LinkCard from "../../../../../_components/LinkCard";
import { Divider } from "@nextui-org/divider";
import SubTitle from "../../../../../_components/text/SubTitle";
import { Checkbox, Spacer } from "@nextui-org/react";
import DropdownInput from "../../../../../_components/inputs/DropdownInput";
import React, { useMemo, useState } from "react";
import "../../../../../../utils/GeneralUtils";
import GenericInput from "../../../../../_components/inputs/GenericInput";
import CardSkeleton from "../../../../../_components/skeletons/CardSkeleton";
import { Chip } from "@nextui-org/chip";
import GenericCard from "../../../../../_components/GenericCard";
import { dollarFormat } from "../../../../../../utils/GeneralUtils";
import {
    fetchDueAt,
    formatInvoiceNumber,
    generateInvoiceTotal,
    invoiceIsOverdue
} from "../../utils/invoice-utils";
import {
    InvoiceCustomerWithOptionalItems,
    InvoiceWithOptionalItems
} from "../../../home/_components/widgets/InvoiceWidget";
import SortIcon from "../../../../../_components/icons/SortIcon";
import CheckboxMenu from "../../../../../_components/CheckboxMenu";
import FilterIcon from "../../../../../_components/icons/FilterIcon";
import { invoiceTypeAsString } from "../../utils";

type Props = {
    customerIsLoading: boolean,
    customer?: InvoiceCustomerWithOptionalItems
}

enum SortMode {
    ASCENDING_DATE = "Oldest - Newest",
    DESCENDING_DATE = "Newest - Oldest",
    ASCENDING_TOTAL = "Lowest Total - Highest Total",
    DESCENDING_TOTAL = "Highest Total - Lowest Total",
}

enum FilterMode {
    PAID = "paid",
    UNPAID = "unpaid",
    OVERDUE = "overdue",
}

const getSortPredicate = (a: InvoiceWithOptionalItems, b: InvoiceWithOptionalItems, sortMode: SortMode): number => {
    switch (sortMode.toLowerCase().replaceAll("_", " ")) {
        case SortMode.ASCENDING_DATE.toLowerCase(): {
            return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        }
        case SortMode.DESCENDING_DATE.toLowerCase(): {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        case SortMode.ASCENDING_TOTAL.toLowerCase(): {
            return generateInvoiceTotal(a) - generateInvoiceTotal(b);
        }
        case SortMode.DESCENDING_TOTAL.toLowerCase(): {
            return generateInvoiceTotal(b) - generateInvoiceTotal(a);
        }
        default: {
            return 0;
        }
    }
};

const getFilterPredicate = (item: Invoice, filterModes?: FilterMode[]): boolean => {
    if (!filterModes || !filterModes.length)
        return true;

    const paidPredicate = (): boolean => item.paid === true;
    const unpaidPredicate = () => item.paid !== true;
    const overduePredicate = () => invoiceIsOverdue(item);

    return ((filterModes.includes(FilterMode.PAID)) && paidPredicate()) ||
        ((filterModes.includes(FilterMode.UNPAID)) && unpaidPredicate()) ||
        ((filterModes.includes(FilterMode.OVERDUE)) && overduePredicate());
};

export default function InvoiceGrid({ customerIsLoading, customer }: Props) {
    const [sortMode, setSortMode] = useState([SortMode.DESCENDING_DATE]);
    const [filterModes, setFilterModes] = useState<FilterMode[]>([]);
    const [search, setSearch] = useState<string>();


    const invoiceCards = useMemo(() => {
        return customer?.invoices
            ?.filter(invoice => getFilterPredicate(invoice, filterModes))
            .filter(invoice => {
                if (!search)
                    return true;
                return invoice.number === Number(search.trim());
            })
            .sort((a, b) => getSortPredicate(a, b, sortMode[0]))
            .map(invoice => {
                const invoiceTotal = dollarFormat.format(Number(invoice.invoiceItems
                    ?.map(item => item.quantity * item.price)
                    .reduce((prev, acc) => prev + acc, 0)));

                return (
                    <LinkCard
                        key={invoice.id}
                        href={`/invoices/${customer?.id}/${invoice.id}`}
                        toolTip={
                            <div className="p-6">
                                <div className="flex gap-4">
                                    <p className="text-primary text-xl break-words font-bold drop-shadow self-center">
                                        {invoiceTypeAsString(invoice)} #{formatInvoiceNumber(invoice.number)}
                                    </p>
                                    {(!invoice.type || invoice.type === "DEFAULT") && (
                                        <Chip
                                            variant="flat"
                                            color={invoice?.paid ? "success" : "danger"}
                                            classNames={{
                                                content: "font-semibold"
                                            }}
                                        >
                                            {invoice?.paid ? "PAID" : (!invoiceIsOverdue(invoice) ? "UNPAID" : "OVERDUE")}
                                        </Chip>
                                    )}
                                </div>
                                <Spacer y={3} />
                                <p className="max-w-lg break-words">
                                    {invoice.description}
                                </p>
                                <Divider className="my-3" />
                                <p className="text-neutral-500 text-sm">Created
                                    on {new Date(invoice.createdAt).toDateString()}</p>
                                {(!invoice.type || invoice.type === "DEFAULT") && (
                                    <p className="text-sm text-neutral-500">Due
                                        By: {fetchDueAt(invoice).toDateString()}</p>
                                )}
                                <p className="text-neutral-500 text-sm">Last updated
                                    at {new Date(invoice.updatedAt).toLocaleTimeString()} on {new Date(invoice.updatedAt).toDateString()}</p>
                            </div>
                        }
                    >
                        <div className="flex flex-col gap-2 w-full">
                            <div className="flex gap-4">
                                <p className="h-full overflow-hidden whitespace-nowrap overflow-ellipsis self-center max-w-1/2">
                                    {invoiceTypeAsString(invoice)} #{formatInvoiceNumber(invoice.number)}
                                </p>
                                {(!invoice.type || invoice.type === "DEFAULT") && (
                                    <Chip
                                        variant="flat"
                                        color={invoice?.paid ? "success" : "danger"}
                                        classNames={{
                                            content: "font-semibold"
                                        }}
                                    >
                                        {invoice?.paid ? "PAID" : (!invoiceIsOverdue(invoice) ? "UNPAID" : "OVERDUE")}
                                    </Chip>
                                )}
                            </div>
                            <Divider className="mb-4" />
                            <p className="text-primary w-fit font-bold default-container py-2 px-4 rounded-xl">
                                {invoiceTotal}
                            </p>
                            {invoice.description &&
                                <p className="text-sm text-neutral-500 max-w-[17rem] tablet:max-w-[10rem] whitespace-nowrap overflow-hidden overflow-ellipsis">{invoice.description}</p>}
                            <Divider className="my-4" />
                            <p className="text-xs text-neutral-500">Created: {new Date(invoice.createdAt).toDateString()}</p>
                            {(!invoice.type || invoice.type === "DEFAULT") && (
                                <p className="text-xs text-neutral-500">Due By: {fetchDueAt(invoice).toDateString()}</p>
                            )}
                        </div>
                    </LinkCard>
                );
            });
    }, [customer?.id, customer?.invoices, search, sortMode, filterModes]);

    return (
        <div className="default-container p-12">
            <div className="flex gap-4">
                <SubTitle className="self-center">All Documents</SubTitle>
                <DropdownInput
                    labelIsIcon
                    icon={<SortIcon />}
                    variant="flat"
                    selectionRequired
                    keys={[SortMode.DESCENDING_DATE, SortMode.ASCENDING_DATE, SortMode.DESCENDING_TOTAL, SortMode.ASCENDING_TOTAL]}
                    selectedKeys={sortMode}
                    setSelectedKeys={(keys) => setSortMode((Array.from(keys) as SortMode[]))}
                />
                <CheckboxMenu
                    buttonProps={{
                        children: <FilterIcon />
                    }}
                    checkboxGroupProps={{
                        label: "Filter",
                        value: filterModes,
                        onValueChange(value) {
                            setFilterModes(value as FilterMode[]);
                        }
                    }}
                >
                    <Checkbox value={FilterMode.PAID}>Paid</Checkbox>
                    <Checkbox value={FilterMode.UNPAID}>Unpaid</Checkbox>
                    <Checkbox value={FilterMode.OVERDUE}>Overdue</Checkbox>
                </CheckboxMenu>
            </div>
            <Divider className="my-6" />
            <div className="w-1/4 tablet:w-1/2 phone:w-full">
                <GenericInput
                    type="number"
                    min="0"
                    id="invoiceSearch"
                    value={search}
                    onValueChange={(value: string | undefined) => setSearch(value)}
                    label="Search"
                    placeholder="Search for a document..."
                    startContent="#"
                    width={24}
                />
            </div>
            <Spacer y={6} />
            <div className="grid grid-cols-3 tablet:grid-cols-2 phone:grid-cols-1 gap-6">
                {
                    customerIsLoading ?
                        <>
                            <CardSkeleton />
                            <CardSkeleton />
                            <CardSkeleton />
                            <CardSkeleton />
                            <CardSkeleton />
                            <CardSkeleton />
                        </>
                        :
                        (invoiceCards?.length ? invoiceCards : <GenericCard>There are no invoices...</GenericCard>)

                }
            </div>
        </div>
    );
}