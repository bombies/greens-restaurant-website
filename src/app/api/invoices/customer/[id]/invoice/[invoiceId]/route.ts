import { authenticated, authenticatedAny, respondWithInit } from "../../../../../../../utils/api/ApiUtils";
import Permission from "../../../../../../../libs/types/permission";
import { NextResponse } from "next/server";
import prisma from "../../../../../../../libs/prisma";
import { INVOICE_ITEM_NAME_REGEX } from "../../../../../../../utils/regex";
import specificInvoiceService from "./service";
import { createInvoiceItemDtoSchema, CreateInvoiceItemsDto, UpdateInvoiceDto, updateInvoiceItemDtoSchema } from "./types";
import { Invoice } from "@prisma/client";

type Context = {
    params: {
        id: string,
        invoiceId: string
    }
}

export function GET(req: Request, { params }: Context) {
    return authenticatedAny(req, async () => {
        const { searchParams } = new URL(req.url);
        const withItems = searchParams.get("with_items")?.toLowerCase() === "true";
        return await specificInvoiceService.fetchInvoice(params.id, params.invoiceId, withItems);
    }, [Permission.VIEW_INVOICES, Permission.CREATE_INVOICE]);
}

export function POST(req: Request, { params }: Context) {
    return authenticatedAny(req, async () => {
        const invoiceResponse = await specificInvoiceService.fetchInvoice(params.id, params.invoiceId);
        if (invoiceResponse.status !== 200)
            return invoiceResponse;
        const invoice = (await invoiceResponse.json()) as Invoice;

        const body = (await req.json()) as CreateInvoiceItemsDto;
        const bodyValidated = createInvoiceItemDtoSchema.safeParse(body);
        if (!body || !bodyValidated.success)
            return respondWithInit({
                message: "Invalid payload!",
                validationErrors: bodyValidated,
                status: 400
            });

        // Check item names
        const invalidNames: string[] = [];
        for (let i = 0; i < body.length; i++) {
            const item = body[i];
            if (!INVOICE_ITEM_NAME_REGEX.test(item.name))
                invalidNames.push(item.name);
        }

        if (invalidNames.length)
            return respondWithInit({
                message: `Some item names are invalid! These include: ${invalidNames.toString()}. Item names must not include "/".`,
                status: 400
            });

        const items = body.map(info => ({
            ...info,
            invoiceId: invoice.id
        }));

        const createdItems = await prisma.invoiceItem.createMany({
            data: items
        });

        return NextResponse.json(createdItems);
    }, [Permission.CREATE_INVOICE]);
}

export function PATCH(req: Request, { params }: Context) {
    return authenticated(req, async () => {
        const invoiceResponse = await specificInvoiceService.fetchInvoice(params.id, params.invoiceId);
        if (invoiceResponse.status !== 200)
            return invoiceResponse;

        const body = (await req.json()) as UpdateInvoiceDto;
        const bodyValidated = updateInvoiceItemDtoSchema.safeParse(body);

        if (!body || !bodyValidated.success)
            return respondWithInit({
                message: "Invalid payload",
                validationErrors: bodyValidated,
                status: 400
            });

        if (body.dueAt)
            body.dueAt = new Date(body.dueAt.toString());

        const updatedInvoice = await prisma.invoice.update({
            where: {
                id: params.invoiceId
            },
            data: body
        });

        return NextResponse.json(updatedInvoice);
    }, Permission.CREATE_INVOICE);
}

export function DELETE(req: Request, { params }: Context) {
    return authenticatedAny(req, async () => {
        const invoiceResponse = await specificInvoiceService.fetchInvoice(params.id, params.invoiceId);
        if (invoiceResponse.status !== 200)
            return invoiceResponse;

        const deletedInvoice = await prisma.invoice.delete({
            where: {
                id: params.invoiceId
            }
        });

        return NextResponse.json(deletedInvoice);
    }, [Permission.CREATE_INVOICE]);
}