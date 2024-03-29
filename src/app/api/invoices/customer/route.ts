import { authenticatedAny, respondWithInit } from "../../../../utils/api/ApiUtils";
import Permission from "../../../../libs/types/permission";
import { NextResponse } from "next/server";
import prisma from "../../../../libs/prisma";
import { InvoiceCustomer } from "@prisma/client";
import { CUSTOMER_NAME_REGEX, EMAIL_REGEX } from "../../../../utils/regex";
import "../../../../utils/GeneralUtils";

export function GET(req: Request) {
    return authenticatedAny(req, async () => {
        const { searchParams } = new URL(req.url);
        const withInvoices = searchParams.get("with_invoices")?.toLowerCase() === "true";
        const withItems = searchParams.get("with_items")?.toLowerCase() === "true";

        return NextResponse.json(await prisma.invoiceCustomer.findMany({
            include: {
                invoices: withInvoices && {
                    include: {
                        invoiceItems: withItems
                    }
                }
            }
        }));
    }, [Permission.VIEW_INVOICES, Permission.CREATE_INVOICE]);
}

export type CreateInvoiceCustomerDto = Omit<InvoiceCustomer, "createdAt" | "updatedAt" | "id">

export function POST(req: Request) {
    return authenticatedAny(req, async () => {
        const body = (await req.json()) as CreateInvoiceCustomerDto;

        if (!CUSTOMER_NAME_REGEX.test(body.customerName))
            return respondWithInit({
                message: "That is an invalid customer name!",
                status: 400
            });

        const validName = body.customerName
            .toLowerCase()
            .trim()
            .replaceAll(/\s{2,}/g, " ");

        const existingCustomer = await prisma.invoiceCustomer.findFirst({
            where: {
                customerName: validName
            }
        });

        if (existingCustomer)
            return respondWithInit({
                message: `There is already a customer with the name "${body.customerName.capitalize()}"`,
                status: 400
            });

        if (body.customerEmail) {
            if (!EMAIL_REGEX.test(body.customerEmail))
                return respondWithInit({
                    message: "That is an invalid email!",
                    status: 400
                });

            const existingEmail = await prisma.invoiceCustomer.findUnique({
                where: {
                    customerEmail: body.customerEmail.toLowerCase()
                }
            });

            if (existingEmail)
                return respondWithInit({
                    message: "There is already a customer with that email address!",
                    status: 400
                });
        }

        return NextResponse.json(
            await prisma.invoiceCustomer.create({
                data: {
                    ...body,
                    customerEmail: body.customerEmail?.toLowerCase()
                }
            })
        );
    }, [Permission.CREATE_INVOICE]);
}

