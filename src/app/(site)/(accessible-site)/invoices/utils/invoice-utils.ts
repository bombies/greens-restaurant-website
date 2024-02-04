import { Invoice, InvoiceType } from "@prisma/client";
import {
    InvoiceWithOptionalItems
} from "../../home/_components/widgets/invoice/InvoiceWidget";

export const generateInvoiceTotal = (invoice?: InvoiceWithOptionalItems): number => {
    return invoice?.invoiceItems
        ?.map(item => item.quantity * item.price)
        .reduce((prev, acc) => prev + acc, 0) ?? 0;
};

export const generateInvoicesTotal = (invoices?: InvoiceWithOptionalItems[], invoiceOnly?: boolean): number => {
    return invoices
        ?.filter(invoice => invoiceOnly ? !invoice.type || invoice.type === InvoiceType.DEFAULT : true)
        ?.reduce((prev, invoice) =>
            prev + generateInvoiceTotal(invoice), 0) ?? 0;
};

export const fetchDueAt = (invoice?: Invoice): Date => {
    if (!invoice)
        return new Date();

    if (!invoice.dueAt) {

        // The default days an invoice will be due in from its creation.
        // Will eventually be converted to a global variable stored in the database
        const DEFAULT_DUE_AT = 30;

        const date = new Date(invoice.createdAt.toString());
        date.setDate(date.getDate() + DEFAULT_DUE_AT);
        return date;
    }

    return new Date(invoice.dueAt.toString());
};

export const invoiceIsOverdue = (invoice: Invoice): boolean => {
    if (invoice.paid)
        return false;

    const dueAt = fetchDueAt(invoice);
    return new Date() > dueAt;
};

function padTo2Digits(num: number) {
    return num.toString().padStart(2, "0");
}

export function formatDate(date: Date, join: string = "/") {
    return [
        date.getFullYear(),
        padTo2Digits(date.getMonth() + 1),
        padTo2Digits(date.getDate())
    ].join(join);
}

export function formatDateDDMMYYYY(date: Date, join: string = "/") {
    return [
        padTo2Digits(date.getDate()),
        padTo2Digits(date.getMonth() + 1),
        date.getFullYear()
    ].join(join);
}

export function formatInvoiceNumber(invoiceNumber: number): string {
    return invoiceNumber.toString().padStart(5, "0");
}