import { Invoice, InvoiceItem } from "@prisma/client";

export const generateInvoiceTotal = (invoice?: Invoice & { invoiceItems: InvoiceItem[] }): number => {
    return invoice?.invoiceItems
        .map(item => item.quantity * item.price)
        .reduce((prev, acc) => prev + acc, 0) ?? 0;
};