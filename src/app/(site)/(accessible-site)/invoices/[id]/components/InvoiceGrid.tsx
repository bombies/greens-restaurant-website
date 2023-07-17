"use client";

import { Invoice, InvoiceCustomer } from "@prisma/client";
import LinkCard from "../../../../../_components/LinkCard";
import { Divider } from "@nextui-org/divider";
import SubTitle from "../../../../../_components/text/SubTitle";
import { Button, Checkbox, CheckboxGroup, Popover, PopoverContent, PopoverTrigger, Spacer } from "@nextui-org/react";
import sortIcon from "/public/icons/green-filter.svg";
import filterIcon from "/public/icons/filter-green.svg";
import searchIcon from "/public/icons/search.svg";
import DropdownInput from "../../../../../_components/inputs/DropdownInput";
import React, { useMemo, useState } from "react";
import "../../../../../../utils/GeneralUtils";
import GenericInput from "../../../../../_components/inputs/GenericInput";
import CardSkeleton from "../../../../../_components/skeletons/CardSkeleton";
import { Chip } from "@nextui-org/chip";
import IconButton from "../../../../../_components/inputs/IconButton";
import GenericImage from "../../../../../_components/GenericImage";

type Props = {
    customerIsLoading: boolean,
    customer?: InvoiceCustomer & { invoices: Invoice[] }
}

enum SortMode {
    ASCENDING_TITLE = "A-Z",
    DESCENDING_TITLE = "Z-A",
    ASCENDING_DATE = "Oldest-Newest",
    DESCENDING_DATE = "Newest-Oldest"
}

enum FilterMode {
    PAID = "paid",
    UNPAID = "unpaid"
}

const getSortPredicate = (a: Invoice, b: Invoice, sortMode: SortMode): number => {
    switch (sortMode.capitalize()) {
        case SortMode.ASCENDING_DATE: {
            return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        }
        case SortMode.DESCENDING_DATE: {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        case SortMode.ASCENDING_TITLE: {
            return a.title.localeCompare(b.title);
        }
        case SortMode.DESCENDING_TITLE: {
            return b.title.localeCompare(a.title);
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

    return ((filterModes.includes(FilterMode.PAID)) && paidPredicate()) ||
        ((filterModes.includes(FilterMode.UNPAID)) && unpaidPredicate());
};

export default function InvoiceGrid({ customerIsLoading, customer }: Props) {
    const [sortMode, setSortMode] = useState([SortMode.DESCENDING_DATE]);
    const [filterModes, setFilterModes] = useState<FilterMode[]>([]);
    const [search, setSearch] = useState<string>();

    const invoiceCards = useMemo(() => {
        return customer?.invoices
            .filter(invoice => getFilterPredicate(invoice, filterModes))
            .filter(invoice => {
                if (!search)
                    return true;
                return invoice.title.toLowerCase().includes(search.toLowerCase().trim());
            })
            .sort((a, b) => getSortPredicate(a, b, sortMode[0]))
            .map(invoice => (
                <LinkCard
                    key={invoice.id}
                    href={`/invoices/${customer?.id}/${invoice.id}`}
                    toolTip={
                        <div className="p-6">
                            <div className="flex gap-4">
                                <p className="text-primary text-xl break-words font-bold drop-shadow self-center">{invoice.title}</p>
                                <Chip
                                    variant="flat"
                                    color={invoice?.paid ? "success" : "danger"}
                                >
                                    {invoice?.paid ? "PAID" : "UNPAID"}
                                </Chip>
                            </div>
                            <Spacer y={3} />
                            <p className="max-w-lg break-words">{invoice.description}</p>
                            <Divider className="my-3" />
                            <p className="text-neutral-500 text-sm">Created
                                on {new Date(invoice.createdAt).toDateString()}</p>
                            <p className="text-neutral-500 text-sm">Last updated
                                at {new Date(invoice.updatedAt).toLocaleTimeString()} on {new Date(invoice.updatedAt).toDateString()}</p>
                        </div>
                    }
                >
                    <div className="flex flex-col gap-2 w-full">
                        <div className="flex gap-4">
                            <p className="overflow-hidden whitespace-nowrap overflow-ellipsis self-center max-w-1/2">{invoice.title}</p>
                            <Chip
                                variant="flat"
                                color={invoice?.paid ? "success" : "danger"}
                            >
                                {invoice?.paid ? "PAID" : "UNPAID"}
                            </Chip>
                        </div>
                        <Divider />
                        {invoice.description && <>
                            <p className="text-sm text-neutral-500 max-w-[17rem] tablet:max-w-[10rem] whitespace-nowrap overflow-hidden overflow-ellipsis">{invoice.description}</p>
                        </>}
                        <p className="text-xs text-neutral-500">Created: {new Date(invoice.createdAt).toDateString()}</p>
                    </div>
                </LinkCard>
            ));
    }, [customer?.id, customer?.invoices, search, sortMode, filterModes]);

    return (
        <div className="default-container p-12">
            <div className="flex gap-4">
                <SubTitle className="self-center">All Invoices</SubTitle>
                <DropdownInput
                    labelIsIcon
                    icon={sortIcon}
                    variant="flat"
                    selectionRequired
                    keys={[SortMode.ASCENDING_TITLE, SortMode.DESCENDING_TITLE, SortMode.DESCENDING_DATE, SortMode.ASCENDING_DATE]}
                    selectedKeys={sortMode}
                    setSelectedKeys={(keys) => setSortMode((Array.from(keys) as SortMode[]))}
                />
                <Popover
                    classNames={{
                        base: "bg-neutral-900/80 backdrop-blur-md border-1 border-white/20 p-6"
                    }}
                    placement="bottom"
                >
                    <PopoverTrigger>
                        <Button isIconOnly variant="flat" color="secondary">
                            <GenericImage className="self-center" src={filterIcon} width={1.35} />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent>
                        <CheckboxGroup
                            label="Filter"
                            color="secondary"
                            value={filterModes}
                            onValueChange={value => setFilterModes(value as FilterMode[])}
                        >
                            <Checkbox value={FilterMode.PAID}>Paid</Checkbox>
                            <Checkbox value={FilterMode.UNPAID}>Unpaid</Checkbox>
                        </CheckboxGroup>
                    </PopoverContent>
                </Popover>
            </div>
            <Divider className="my-6" />
            <div className="w-1/4 tablet:w-1/2 phone:w-full">
                <GenericInput
                    iconLeft={searchIcon}
                    id="invoiceSearch"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    label="Search"
                    placeholder="Search for an invoice..."
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
                        invoiceCards

                }
            </div>
        </div>
    );
}