"use client";

import CardSkeleton from "../../../../_components/skeletons/CardSkeleton";
import LinkCard from "../../../../_components/LinkCard";
import SubTitle from "../../../../_components/text/SubTitle";
import { Spacer } from "@nextui-org/react";
import clsx from "clsx";
import GenericCard from "../../../../_components/GenericCard";
import { InvoiceCustomerHook, useInvoiceCustomers } from "./hooks/useInvoiceCustomers";
import { Divider } from "@nextui-org/divider";
import GenericInput from "../../../../_components/inputs/GenericInput";
import SearchIcon from "../../../../_components/icons/SearchIcon";
import React, { FC, Fragment } from "react";

const InvoiceCustomerGrid: FC<InvoiceCustomerHook> = ({
                                                          customers,
                                                          visibleCustomers,
                                                          search,
                                                          setSearch,
                                                          isLoading
                                                      }) => {
    const customerElements = customers?.map(customer => (
        <LinkCard key={customer.id} href={`/invoices/${customer.id}`}>
            <div className="whitespace-nowrap overflow-hidden">
                <p className="capitalize overflow-hidden overflow-ellipsis font-semibold">{customer.customerName}</p>
                {
                    customer.customerDescription &&
                    <Fragment>
                        <Divider className="my-4" />
                        <p className="text-sm text-neutral-500 overflow-hidden overflow-ellipsis">{customer.customerDescription}</p>
                    </Fragment>
                }
            </div>
        </LinkCard>
    ));

    return (
        <div className="default-container p-12 w-[50%] tablet:w-full">
            <SubTitle>Select a customer</SubTitle>
            <Spacer y={6} />
            <div className="w-1/2 phone:w-full">
                <GenericInput
                    id="search"
                    startContent={<SearchIcon fill="rgb(115 115 115)" width={16} />}
                    value={search}
                    onValueChange={setSearch}
                    placeholder="Search for a customer..."
                />
            </div>
            <Divider className="my-6" />
            <div className={clsx(
                "grid-cols-1 gap-4",
                (customerElements?.length || isLoading) && "grid"
            )}>
                {
                    isLoading ?
                        <>
                            <CardSkeleton />
                            <CardSkeleton />
                            <CardSkeleton />
                            <CardSkeleton />
                            <CardSkeleton />
                            <CardSkeleton />
                        </>
                        :
                        (customerElements?.length ? customerElements :
                            <GenericCard>There are no customers...</GenericCard>)
                }
            </div>
        </div>
    );
};

export default InvoiceCustomerGrid;