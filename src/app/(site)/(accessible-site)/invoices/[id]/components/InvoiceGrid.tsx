"use client";

import { Invoice, InvoiceCustomer } from "@prisma/client";
import LinkCard from "../../../../../_components/LinkCard";
import { Divider } from "@nextui-org/divider";
import SubTitle from "../../../../../_components/text/SubTitle";
import { Spacer } from "@nextui-org/react";
import filterIcon from "/public/icons/green-filter.svg";
import searchIcon from "/public/icons/search.svg";
import DropdownInput from "../../../../../_components/inputs/DropdownInput";
import { useMemo, useState } from "react";
import "../../../../../../utils/GeneralUtils";
import GenericInput from "../../../../../_components/inputs/GenericInput";

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

export default function InvoiceGrid({ customerIsLoading, customer }: Props) {
    const [sortMode, setSortMode] = useState([SortMode.DESCENDING_DATE]);
    const [search, setSearch] = useState<string>();

    const invoiceCards = useMemo(() => {
        return customer?.invoices
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
                >
                    <div className="flex flex-col gap-2">
                        <p>{invoice.title}</p>
                        {invoice.description && <>
                            <Divider />
                            <p className="text-sm text-neutral-500 max-w-[17rem] tablet:max-w-[10rem] whitespace-nowrap overflow-hidden overflow-ellipsis">{invoice.description}</p>
                        </>}
                    </div>
                </LinkCard>
            ));
    }, [customer?.id, customer?.invoices, search, sortMode]);

    return (
        <div className="default-container p-12">
            <div className="flex gap-4">
                <SubTitle className="self-center">All Invoices</SubTitle>
                <DropdownInput
                    labelIsIcon
                    icon={filterIcon}
                    variant="flat"
                    selectionRequired
                    keys={[SortMode.ASCENDING_TITLE, SortMode.DESCENDING_TITLE, SortMode.DESCENDING_DATE, SortMode.ASCENDING_DATE]}
                    selectedKeys={sortMode}
                    setSelectedKeys={(keys) => setSortMode((Array.from(keys) as SortMode[]))}
                />
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
                        "Loading..."
                        :
                        invoiceCards

                }
            </div>
        </div>
    );
}