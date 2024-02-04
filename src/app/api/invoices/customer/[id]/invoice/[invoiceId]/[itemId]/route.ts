import { authenticated, respondWithInit } from "../../../../../../../../utils/api/ApiUtils";
import Permission from "../../../../../../../../libs/types/permission";
import { Either } from "../../../../../../inventory/[name]/service";
import { NextResponse } from "next/server";
import { Invoice, InvoiceItem } from "@prisma/client";
import prisma from "../../../../../../../../libs/prisma";
import { INVOICE_ITEM_NAME_REGEX } from "../../../../../../../../utils/regex";
import specificInvoiceService from "../service";
import { UpdateInvoiceItemDto, updateInvoiceItemDtoSchema } from "./types";
import {
    InvoiceWithOptionalItems
} from "../../../../../../../(site)/(accessible-site)/home/_components/widgets/invoice/InvoiceWidget";
import { buildFailedValidationResponse, buildResponse } from "../../../../../../utils/utils";

type Context = {
    params: {
        id: string,
        invoiceId: string,
        itemId: string
    }
}

const fetchInvoiceItem = async (customerId: string, invoiceId: string, itemId: string) => {
    const invoiceResponse = await specificInvoiceService.fetchInvoice(customerId, invoiceId, true);
    if (invoiceResponse.status !== 200)
        return invoiceResponse;
    const invoice = (await invoiceResponse.json()) as InvoiceWithOptionalItems;

    const item = invoice.invoiceItems!.find(item => item.id === itemId);
    if (!item)
        return buildResponse({
            message: `There was no item found with the id "${itemId}" for invoice with id: ${invoiceId}`,
            status: 404
        });
    return buildResponse({
        data: item
    });
};


export function PATCH(req: Request, { params }: Context) {
    return authenticated(req, async () => {
        const itemResponse = await fetchInvoiceItem(params.id, params.invoiceId, params.itemId);
        if (itemResponse.status !== 200)
            return itemResponse;

        const body = (await req.json()) as UpdateInvoiceItemDto;
        const bodyValidated = updateInvoiceItemDtoSchema.safeParse(body);
        if (!bodyValidated.success)
            return buildFailedValidationResponse(bodyValidated.error)


        if (body.name && !INVOICE_ITEM_NAME_REGEX.test(body.name))
            return respondWithInit({
                message: "That name is invalid! The item name must not contain \"/\".",
                status: 400
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
        if (item.status !== 200)
            return item;

        const deletedItem = await prisma.invoiceItem.delete({
            where: {
                id: params.itemId
            }
        });

        return NextResponse.json(deletedItem);
    }, Permission.CREATE_INVOICE);
}