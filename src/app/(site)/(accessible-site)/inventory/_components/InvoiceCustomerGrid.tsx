"use client";

import CardSkeleton from "../../../../_components/skeletons/CardSkeleton";
import LinkCard from "../../../../_components/LinkCard";
import useSWR from "swr";
import { fetcher } from "../../employees/_components/EmployeeGrid";
import { InvoiceCustomer } from "@prisma/client";
import SubTitle from "../../../../_components/text/SubTitle";
import { Spacer } from "@nextui-org/react";

const FetchCustomers = () => {
    return useSWR(`/api/invoices/customer`, fetcher<InvoiceCustomer[]>);
};

export default function InvoiceCustomerGrid() {
    const { data: customers, isLoading } = FetchCustomers();
    const customerElements = customers?.map(customer => (
        <LinkCard key={customer.id} href={`/invoices/${customer.id}`}>
            <p className="capitalize">{customer.customerName}</p>
        </LinkCard>
    ));

    return (
        <div className="default-container p-12 w-[50%] tablet:w-full">
            <SubTitle>Select a customer</SubTitle>
            <Spacer y={6} />
            <div className="grid grid-cols-3 tablet:grid-cols-2 phone:grid-cols-1 gap-4">
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
                        (customerElements?.length ? customerElements : <p>There are no customers!</p>)
                }
            </div>
        </div>
    );
}