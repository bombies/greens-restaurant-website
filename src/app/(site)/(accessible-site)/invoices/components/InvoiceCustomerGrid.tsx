"use client";

import CardSkeleton from "../../../../_components/skeletons/CardSkeleton";
import LinkCard from "../../../../_components/LinkCard";
import useSWR from "swr";
import { fetcher } from "../../employees/_components/EmployeeGrid";
import { Invoice, InvoiceCustomer, InvoiceItem } from "@prisma/client";
import SubTitle from "../../../../_components/text/SubTitle";
import { Spacer } from "@nextui-org/react";
import clsx from "clsx";
import { Card, CardBody } from "@nextui-org/card";
import GenericCard from "../../../../_components/GenericCard";
import { InvoiceCustomerWithInvoiceItems } from "../reports/components/hooks/useCustomerReports";

export const FetchCustomers = () => {
    return useSWR(`/api/invoices/customer`, fetcher<InvoiceCustomerWithInvoiceItems[]>);
};

export default function InvoiceCustomerGrid() {
    const { data: customers, isLoading } = FetchCustomers();
    const customerElements = customers?.map(customer => (
        <LinkCard key={customer.id} href={`/invoices/${customer.id}`}>
            <p className="capitalize overflow-hidden whitespace-nowrap overflow-ellipsis">{customer.customerName}</p>
        </LinkCard>
    ));

    return (
        <div className="default-container p-12 w-[50%] tablet:w-full">
            <SubTitle>Select a customer</SubTitle>
            <Spacer y={6} />
            <div className={clsx(
                "grid-cols-3 tablet:grid-cols-2 phone:grid-cols-1 gap-4",
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
}