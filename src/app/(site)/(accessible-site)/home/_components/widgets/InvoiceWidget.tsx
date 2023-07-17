"use client";

import useSWR from "swr";
import { fetcher } from "../../../employees/_components/EmployeeGrid";
import { Invoice, InvoiceCustomer } from "@prisma/client";
import { Spinner } from "@nextui-org/spinner";
import { Fragment, useMemo } from "react";
import { Divider } from "@nextui-org/divider";
import LinkCard from "../../../../../_components/LinkCard";
import { Chip } from "@nextui-org/chip";
import SubTitle from "../../../../../_components/text/SubTitle";
import { Accordion, AccordionItem } from "@nextui-org/react";

const FetchInvoiceCustomers = () => {
    return useSWR("/api/invoices/customer", fetcher<(InvoiceCustomer & { invoices: Invoice[] })[]>);
};

export default function InvoiceWidget() {
    const { data: invoiceCustomers, isLoading: invoiceCustomersLoading } = FetchInvoiceCustomers();

    const customerElements = useMemo(() => invoiceCustomers?.map(customer => (
        <AccordionItem key={customer.id} className="default-container p-6" title={customer.customerName}
                       aria-label={customer.customerName}>
            <Divider className="my-4" />
            <div className="flex flex-col gap-4">
                {
                    customer.invoices.length ? customer.invoices.map(invoice => (
                            <LinkCard
                                key={invoice.id}
                                href={`/invoices/${customer.id}/${invoice.id}`}
                            >
                                <div>
                                    <div className="flex gap-2">
                                        <p className="text-medium max-w-[70%] overflow-hidden whitespace-nowrap overflow-ellipsis">{invoice.title}</p>
                                        <Chip
                                            variant="flat"
                                            color={invoice.paid ? "success" : "danger"}
                                            className="uppercase"
                                        >
                                            {invoice.paid ? "paid" : "unpaid"}
                                        </Chip>
                                    </div>
                                    {invoice.description &&
                                        <p className="text-neutral-500 text-sm max-w-[90%] break-all overflow-hidden whitespace-nowrap overflow-ellipsis">{invoice.description}</p>}
                                </div>
                            </LinkCard>
                        ))
                        :
                        <p className="default-container p-6">No Data...</p>
                }
            </div>
        </AccordionItem>
    )), [invoiceCustomers]);

    return (
        <div className="default-container backdrop-blur-md pt-6 px-6 pb-12 w-[26rem] h-96 phone:w-full">
            {
                invoiceCustomersLoading ?
                    <div className="flex justify-center items-center"><Spinner size="lg" /></div>
                    :
                    (<Fragment>
                        <h3 className="font-black text-lg text-primary capitalize mb-4">
                            Invoices
                        </h3>
                        {
                            customerElements?.length ?
                                <div className="h-full overflow-y-auto">
                                    <Accordion
                                        variant="splitted"
                                        itemClasses={{
                                            base: "!default-container !p-6 !rounded-2xl",
                                            title: "font-bold text-lg"
                                        }}
                                    >
                                        {customerElements}
                                    </Accordion>
                                </div>
                                :
                                <div className="flex h-full justify-center items-center">
                                    <SubTitle>No Data...</SubTitle>
                                </div>
                        }

                    </Fragment>)
            }
        </div>
    );
}