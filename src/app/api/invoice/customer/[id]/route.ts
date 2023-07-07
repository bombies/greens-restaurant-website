import { authenticatedAny, respondWithInit } from "../../../../../utils/api/ApiUtils";
import { CUSTOMER_NAME_REGEX, EMAIL_REGEX } from "../../../../../utils/regex";
import prisma from "../../../../../libs/prisma";
import { NextResponse } from "next/server";
import Permission from "../../../../../libs/types/permission";
import { CreateCustomerBody } from "../route";

type Context = {
    params: {
        id: string
    }
}

type UpdateCustomerBody = Partial<CreateCustomerBody>

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

        const body = (await req.json()) as UpdateCustomerBody;

        let newName: string | undefined = undefined;
        if (body.customerName) {
            if (!CUSTOMER_NAME_REGEX.test(body.customerName))
                return respondWithInit({
                    message: "That is an invalid customer name!",
                    status: 401
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
                    status: 401
                });

            newName = validName;
        }

        let newEmail: string | undefined = undefined;
        if (body.customerEmail) {
            if (!EMAIL_REGEX.test(body.customerEmail))
                return respondWithInit({
                    message: "That is an invalid email!",
                    status: 401
                });

            const existingCustomer = await prisma.invoiceCustomer.findUnique({
                where: {
                    customerEmail: body.customerEmail.toLowerCase()
                }
            });

            if (existingCustomer)
                return respondWithInit({
                    message: "There is already a customer with that email address!",
                    status: 401
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
                    customerEmail: newEmail
                }
            })
        );
    }, [Permission.CREATE_INVOICE]);
}