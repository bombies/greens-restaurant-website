import { authenticated, respondWithInit } from "../../../../../../../../utils/api/ApiUtils";
import Permission from "../../../../../../../../libs/types/permission";
import prisma from "../../../../../../../../libs/prisma";
import { NextResponse } from "next/server";

type Context = {
    params: {
        id: string,
        invoiceId: string
    }
}

export type DeleteManyInvoiceItemsDto = {
    itemsToDelete: string[]
}

export function DELETE(req: Request, { params }: Context) {
    return authenticated(req, async () => {
        const body = (await req.json()) as DeleteManyInvoiceItemsDto;
        if (!body.itemsToDelete)
            return respondWithInit({
                message: "You must provide ids to delete!",
                status: 400
            });

        const deletedItems = await prisma.invoiceItem.deleteMany({
            where: {
                id: {
                    in: body.itemsToDelete
                }
            }
        });

        if (body.itemsToDelete.length !== deletedItems.count)
            return respondWithInit({
                message: "Not all records were deleted.",
                status: 206
            });

        return NextResponse.json(deletedItems);
    }, Permission.CREATE_INVOICE);
}