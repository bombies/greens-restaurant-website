"use client";

import axios from "axios";
import useSWRMutation from "swr/mutation";
import { Invoice, InvoiceCustomer } from "@prisma/client";
import useSWR from "swr";
import { fetcher } from "../../employees/_components/EmployeeGrid";
import {
    InvoiceCustomerWithOptionalItems,
    InvoiceWithOptionalItems
} from "../../home/_components/widgets/InvoiceWidget";

export type InvoiceWithCustomer = Invoice & {
    customer: InvoiceCustomer
}

type FetchInvoiceByNumberArgs = {
    arg: {
        number: number
    }
}

export const FetchInvoice = (customerId: string, invoiceId: string, withItems?: boolean) => {
    return useSWR(`/api/invoices/customer/${customerId}/invoice/${invoiceId}?with_items=${withItems ?? false}`, fetcher<InvoiceWithOptionalItems>);
};

export const FetchInvoiceCustomers = (params?: { withInvoices?: boolean, withItems?: boolean }) => {
    return useSWR(
        `/api/invoices/customer?with_invoices=${params?.withInvoices ?? false}&with_items=${params?.withItems ?? false}`,
        fetcher<InvoiceCustomerWithOptionalItems[]>, {
            revalidateOnMount: true
        });
};

export const FetchInvoiceCustomer = (id: string, withInvoices?: boolean, withItems?: boolean) => {
    return useSWR(`/api/invoices/customer/${id}/invoices?with_invoices=${withInvoices ?? false}&with_items=${withItems ?? false}`, fetcher<InvoiceCustomerWithOptionalItems>);
};

export const FetchInvoiceByNumber = () => {
    const fetcher = (url: string, { arg }: FetchInvoiceByNumberArgs) => axios.get(url.replaceAll("{number}", arg.number.toString()));
    return useSWRMutation(`/api/invoices/{number}`, fetcher);
};