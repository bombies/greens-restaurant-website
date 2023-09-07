import { Invoice, InvoiceCustomer, InvoiceItem } from "@prisma/client";

export type InvoiceWithExtras = Invoice & {
    customer: InvoiceCustomer,
    invoiceItems: InvoiceItem[]
}