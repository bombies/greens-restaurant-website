import { Either } from "../../../inventory/[name]/service";
import { Invoice, InvoiceCustomer, InvoiceItem } from "@prisma/client";
import { NextResponse } from "next/server";
import { respondWithInit } from "../../../../../utils/api/ApiUtils";
import prisma from "../../../../../libs/prisma";

class SpecificCustomerService {
    constructor(private readonly customerId: string) {
    }

    fetchCustomerInfo = async (withInvoices?: boolean, withInvoiceItems?: boolean): Promise<Either<InvoiceCustomer & {
        invoices?: (Invoice & { invoiceItems?: InvoiceItem[] })[]
    }, NextResponse>> => {
        if (!/^[a-f\d]{24}$/i.test(this.customerId))
            return new Either<InvoiceCustomer & {
                invoices?: (Invoice & { invoiceItems?: InvoiceItem[] })[]
            }, NextResponse>(undefined, respondWithInit({
                message: "That ID isn't a valid ID!",
                status: 404
            }));

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
            return new Either<InvoiceCustomer, NextResponse>(undefined, respondWithInit({
                message: `There is no customer with the id: ${this.customerId}`,
                status: 404
            }));

        return new Either<InvoiceCustomer, NextResponse>(existingCustomer);
    };
}

const specificCustomerService = (id: string) => new SpecificCustomerService(id)
export default specificCustomerService