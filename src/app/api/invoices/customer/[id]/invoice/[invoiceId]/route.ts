import { authenticated, authenticatedAny, respondWithInit } from "../../../../../../../utils/api/ApiUtils";
import Permission from "../../../../../../../libs/types/permission";
import { fetchCustomerInfo } from "../../route";
import { NextResponse } from "next/server";
import { Invoice, InvoiceItem } from "@prisma/client";
import prisma from "../../../../../../../libs/prisma";
import { Either } from "../../../../../inventory/[name]/utils";
import { INVOICE_ITEM_NAME_REGEX } from "../../../../../../../utils/regex";
import { z } from "zod";

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
        const invoice = await fetchInvoice(params.id, params.invoiceId, withItems);
        if (invoice.error)
            return invoice.error;
        return NextResponse.json(invoice.success);
    }, [Permission.VIEW_INVOICES, Permission.CREATE_INVOICE]);
}

export const fetchInvoice = async (customerId: string, invoiceId: string, withItems?: boolean): Promise<Either<Invoice & {
    invoiceItems?: InvoiceItem[]
}, NextResponse>> => {
    const customerInfo = await fetchCustomerInfo(customerId, true, withItems);
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

export type CreateInvoiceItemsDto = Omit<InvoiceItem, "id" | "createdAt" | "updatedAt" | "invoiceId">[]
const createInvoiceDtoSchema = z.array(z.object({
    name: z.string(),
    description: z.string().optional(),
    price: z.number(),
    quantity: z.number()
}).strict());

export function POST(req: Request, { params }: Context) {
    return authenticatedAny(req, async () => {
        const invoice = await fetchInvoice(params.id, params.invoiceId);
        if (invoice.error)
            return invoice.error;

        const body = (await req.json()) as CreateInvoiceItemsDto;
        const bodyValidated = createInvoiceDtoSchema.safeParse(body);
        if (!body || !bodyValidated.success)
            return respondWithInit({
                message: "Invalid payload!",
                validationErrors: bodyValidated,
                status: 401
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
                status: 401
            });

        const items = body.map(info => ({
            ...info,
            invoiceId: invoice.success!.id
        }));

        const createdItems = await prisma.invoiceItem.createMany({
            data: items
        });

        return NextResponse.json(createdItems);
    }, [Permission.CREATE_INVOICE]);
}

export type UpdateInvoiceDto = Partial<Omit<Invoice, "createdAt" | "updatedAt" | "customerId" | "id" | "number">>;
const updateInvoiceDtoSchema = z.object({
    description: z.string(),
    paid: z.boolean(),
    dueAt: z.date()
}).partial().strict();

export function PATCH(req: Request, { params }: Context) {
    return authenticated(req, async () => {
        const invoice = await fetchInvoice(params.id, params.invoiceId);
        if (invoice.error)
            return invoice.error;

        const body = (await req.json()) as UpdateInvoiceDto;
        const bodyValidated = updateInvoiceDtoSchema.safeParse(body);

        if (!body || !bodyValidated.success)
            return respondWithInit({
                message: "You must provide a body for this request!",
                validationErrors: bodyValidated,
                status: 401
            });

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
        const invoice = await fetchInvoice(params.id, params.invoiceId);
        if (invoice.error)
            return invoice.error;

        const deletedInvoice = await prisma.invoice.delete({
            where: {
                id: params.invoiceId
            }
        });

        return NextResponse.json(deletedInvoice);
    }, [Permission.CREATE_INVOICE]);
}