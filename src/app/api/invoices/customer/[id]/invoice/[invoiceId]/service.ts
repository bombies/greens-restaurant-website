import { Either } from "../../../../../inventory/[name]/service";
import { Invoice, InvoiceItem } from "@prisma/client";
import { NextResponse } from "next/server";
import { respondWithInit } from "../../../../../../../utils/api/ApiUtils";
import specificCustomerService from "../../service";

class SpecificInvoiceService {
    constructor() {
    }

    fetchInvoice = async (customerId: string, invoiceId: string, withItems?: boolean): Promise<Either<Invoice & {
        invoiceItems?: InvoiceItem[]
    }, NextResponse>> => {
        if (!/^[a-f\d]{24}$/i.test(customerId))
            return new Either<Invoice & { invoiceItems?: InvoiceItem[] }, NextResponse>(undefined, respondWithInit({
                message: "The customer ID is an invalid ID!",
                status: 404
            }));
        if (!/^[a-f\d]{24}$/i.test(invoiceId))
            return new Either<Invoice & { invoiceItems?: InvoiceItem[] }, NextResponse>(undefined, respondWithInit({
                message: "The customer ID is an invalid ID!",
                status: 404
            }));

        const customerInfo = await specificCustomerService(customerId).fetchCustomerInfo(true, withItems);
        if (customerInfo.error)
            return new Either<Invoice & { invoiceItems?: InvoiceItem[] }, NextResponse>(undefined, customerInfo.error);

        const invoices = customerInfo.success!.invoices!;
        const thisInvoice = invoices.find(invoice => invoice.id === invoiceId);
        if (!thisInvoice)
            return new Either<Invoice & { invoiceItems?: InvoiceItem[] }, NextResponse>(undefined, respondWithInit({
                message: `There is no invoice for ${customerInfo.success!.customerName} with the id: ${invoiceId}`,
                status: 404
            }));
        return new Either<Invoice & { invoiceItems?: InvoiceItem[] }, NextResponse>(thisInvoice);
    };
}

const specificInvoiceService = new SpecificInvoiceService()
export default specificInvoiceService