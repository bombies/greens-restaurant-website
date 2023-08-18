import { authenticated, respondWithInit } from "../../../../../../../../utils/api/ApiUtils";
import Permission from "../../../../../../../../libs/types/permission";
import { fetchInvoice } from "../route";
import { Either } from "../../../../../../inventory/[name]/utils";
import { NextResponse } from "next/server";
import { InvoiceItem } from "@prisma/client";
import prisma from "../../../../../../../../libs/prisma";
import { INVOICE_ITEM_NAME_REGEX } from "../../../../../../../../utils/regex";
import { z } from "zod";

type Context = {
    params: {
        id: string,
        invoiceId: string,
        itemId: string
    }
}

const fetchInvoiceItem = async (customerId: string, invoiceId: string, itemId: string): Promise<Either<InvoiceItem, NextResponse>> => {
    const invoice = await fetchInvoice(customerId, invoiceId, true);
    if (invoice.error)
        return new Either<InvoiceItem, NextResponse>(undefined, invoice.error);

    const item = invoice.success!.invoiceItems!.find(item => item.id === itemId);
    if (!item)
        return new Either<InvoiceItem, NextResponse>(
            undefined,
            respondWithInit({
                message: `There was no item found with the id "${itemId}" for invoice with id: ${invoiceId}`,
                status: 404
            })
        );
    return new Either<InvoiceItem, NextResponse>(item);
};

export type UpdateInvoiceItemDto = Omit<Partial<InvoiceItem>, "invoiceId" | "id" | "createdAt" | "updatedAt">
const updateInvoiceItemDtoSchema = z.object({
    name: z.string(),
    description: z.string(),
    price: z.number(),
    quantity: z.number()
}).strict().partial();

export function PATCH(req: Request, { params }: Context) {
    return authenticated(req, async () => {
        const item = await fetchInvoiceItem(params.id, params.invoiceId, params.itemId);
        if (item.error)
            return item.error;

        const body = (await req.json()) as UpdateInvoiceItemDto;
        const bodyValidated = updateInvoiceItemDtoSchema.safeParse(body);
        if (!body || !bodyValidated.success)
            return respondWithInit({
                message: "Invalid payload!",
                validationErrors: bodyValidated,
                status: 401
            });


        if (body.name && !INVOICE_ITEM_NAME_REGEX.test(body.name))
            return respondWithInit({
                message: "That name is invalid! The item name must not contain \"/\".",
                status: 401
            });

        const updatedItem = await prisma.invoiceItem.update({
            where: {
                id: params.itemId
            },
            data: body
        });

        return NextResponse.json(updatedItem);
    }, Permission.CREATE_INVOICE);
}

export function DELETE(req: Request, { params }: Context) {
    return authenticated(req, async () => {
        const item = await fetchInvoiceItem(params.id, params.invoiceId, params.itemId);
        if (item.error)
            return item.error;

        const deletedItem = await prisma.invoiceItem.delete({
            where: {
                id: params.itemId
            }
        });

        return NextResponse.json(deletedItem);
    }, Permission.CREATE_INVOICE);
}