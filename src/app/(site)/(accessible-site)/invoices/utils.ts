import { Invoice, InvoiceType } from "@prisma/client";

export const invoiceTypeAsString = (data?: Invoice | InvoiceType | null) => {
    let type: InvoiceType | null;
    if ((data as Invoice)?.type !== undefined) {
        type = (data as Invoice).type
    } else type = data as InvoiceType | null;
    return (!type || type === InvoiceType.DEFAULT) ? "Invoice" : (type === InvoiceType.QUOTE ? "Quote" : "Cash Receipt")
}