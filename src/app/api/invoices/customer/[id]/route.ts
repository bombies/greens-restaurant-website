import { authenticated, authenticatedAny, respondWithInit } from "../../../../../utils/api/ApiUtils";
import { CUSTOMER_NAME_REGEX, EMAIL_REGEX } from "../../../../../utils/regex";
import prisma from "../../../../../libs/prisma";
import { NextResponse } from "next/server";
import Permission from "../../../../../libs/types/permission";
import { UpdateCustomerDto } from "./types";
import specificCustomerService from "./service";
import { InvoiceCustomer } from "@prisma/client";

type Context = {
    params: {
        id: string
    }
}


export function GET(req: Request, { params }: Context) {
    return authenticatedAny(req, async () => {
        return NextResponse.json(await specificCustomerService(params.id).fetchCustomerInfo());
    }, [Permission.VIEW_INVOICES, Permission.CREATE_INVOICE]);
}

export function PATCH(req: Request, { params }: Context) {
    return authenticatedAny(req, async () => {
        const existingCustomer = await prisma.invoiceCustomer.findUnique({
            where: {
                id: params.id
            }
        });

        if (!existingCustomer)
            return respondWithInit({
                message: `There is no customer with the id: ${params.id}`,
                status: 404
            });

        const body = (await req.json()) as UpdateCustomerDto;

        let newName: string | undefined = undefined;
        if (body.customerName) {
            if (!CUSTOMER_NAME_REGEX.test(body.customerName))
                return respondWithInit({
                    message: "That is an invalid customer name!",
                    status: 400
                });

            const validName = body.customerName
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

            newName = validName;
        }

        let newEmail: string | undefined = undefined;
        if (body.customerEmail) {
            if (!EMAIL_REGEX.test(body.customerEmail))
                return respondWithInit({
                    message: "That is an invalid email!",
                    status: 400
                });

            const existingCustomer = await prisma.invoiceCustomer.findUnique({
                where: {
                    customerEmail: body.customerEmail.toLowerCase()
                }
            });

            if (existingCustomer)
                return respondWithInit({
                    message: "There is already a customer with that email address!",
                    status: 400
                });

            newEmail = body.customerEmail.toLowerCase();
        }

        return NextResponse.json(
            await prisma.invoiceCustomer.update({
                where: {
                    id: params.id
                },
                data: {
                    customerName: newName,
                    customerAddress: body.customerAddress,
                    customerEmail: newEmail,
                    customerDescription: body.customerDescription
                }
            })
        );
    }, [Permission.CREATE_INVOICE]);
}

export function DELETE(req: Request, { params }: Context) {
    return authenticated(req, async () => {
        const customerResponse = await specificCustomerService(params.id).fetchCustomerInfo();
        if (customerResponse.status !== 200)
            return customerResponse;

        const customer: InvoiceCustomer = await customerResponse.json();
        const deletedCustomer = await prisma.invoiceCustomer.delete({
            where: {
                id: customer.id
            }
        });

        return NextResponse.json(deletedCustomer);
    }, Permission.CREATE_INVOICE);
}