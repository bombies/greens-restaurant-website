import { Invoice, InvoiceItem } from "@prisma/client";

export const generateInvoiceTotal = (invoice?: Invoice & { invoiceItems: InvoiceItem[] }): number => {
    return invoice?.invoiceItems
        .map(item => item.quantity * item.price)
        .reduce((prev, acc) => prev + acc, 0) ?? 0;
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
        date.getFullYear(),
    ].join(join);
}