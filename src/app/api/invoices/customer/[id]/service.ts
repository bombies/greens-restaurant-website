import { Invoice, InvoiceCustomer, InvoiceItem, InvoiceType } from "@prisma/client";
import { NextResponse } from "next/server";
import prisma from "../../../../../libs/prisma";
import { buildResponse } from "../../../utils/utils";
import {
    InvoiceCustomerWithOptionalInvoices
} from "../../../../(site)/(accessible-site)/home/_components/widgets/InvoiceWidget";

class SpecificCustomerService {
    constructor(private readonly customerId: string) {
    }

    fetchCustomerInfo = async (withInvoices?: boolean, withInvoiceItems?: boolean): Promise<NextResponse<InvoiceCustomer & {
        invoices?: (Invoice & { invoiceItems?: InvoiceItem[] })[]
    } | null>> => {
        if (!/^[a-f\d]{24}$/i.test(this.customerId))
            return buildResponse({
                status: 404,
                message: "That ID isn't a valid ID!"
            });

        const existingCustomer = await prisma.invoiceCustomer.findUnique({
            where: { id: this.customerId },
            include: {
                invoices: withInvoices && {
                    include: {
                        invoiceItems: withInvoiceItems
                    }
                }
            }
        });

        if (!existingCustomer)
            return buildResponse({
                status: 404,
                message: `There is no customer with the id: ${this.customerId}`
            });

        return buildResponse({ data: existingCustomer });
    };

    createInvoice = async (type: InvoiceType = InvoiceType.DEFAULT): Promise<NextResponse<Invoice | null>> => {
        const response = await this.fetchCustomerInfo(true);
        if (response.status === 404)
            return response as NextResponse<null>;

        const customerInfo = (await response.json()) as InvoiceCustomerWithOptionalInvoices;
        const invoiceNumber = (await prisma.invoice.count()) + 1;
        const createdInvoice = await prisma.invoice.create({
            data: {
                number: invoiceNumber,
                customerId: customerInfo!.id,
                type
            },
            include: {
                invoiceItems: true
            }
        });

        return buildResponse({ data: createdInvoice });
    };

    updateInvoice = async (invoiceId: string, type?: InvoiceType): Promise<NextResponse<Invoice | null>> => {
        const response = await this.fetchCustomerInfo(true);
        if (response.status === 404)
            return response as NextResponse<null>;

        const updatedInvoice = await prisma.invoice.update({
            where: { id: invoiceId },
            data: { type }
        });

        return buildResponse({ data: updatedInvoice });
    };
}

const specificCustomerService = (id: string) => new SpecificCustomerService(id);
export default specificCustomerService;