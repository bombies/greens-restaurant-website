import { authenticatedAny, respondWithInit } from "../../../../../../../utils/api/ApiUtils";
import Permission from "../../../../../../../libs/types/permission";
import prisma from "../../../../../../../libs/prisma";
import { NextResponse } from "next/server";
import { RequestedStockItem } from "@prisma/client";
import { z } from "zod";

type Context = {
    params: {
        id: string,
        itemId: string,
    }
}

export function GET(req: Request, { params }: Context) {
    return authenticatedAny(req, async (session) => {
        if (!session.user)
            return respondWithInit({
                message: "Could not find an authenticated user for this session! Please try logging in again.",
                status: 403
            });

        const fetchedItem = await prisma.requestedStockItem.findFirst({
            where: {
                AND: [
                    { id: params.itemId },
                    { stockRequest: { requestedByUserId: session.user.id } }
                ]
            },
            include: {
                stockRequest: true
            }
        });
        return NextResponse.json(fetchedItem);
    }, [
        Permission.CREATE_INVENTORY,
        Permission.CREATE_STOCK_REQUEST,
        Permission.MANAGE_STOCK_REQUESTS,
        Permission.VIEW_STOCK_REQUESTS
    ]);
}

export type UpdateRequestedStockItemDto = Pick<RequestedStockItem, "amountRequested">
const updateRequestedStockItemDtoSchema = z.object({
    "amountRequested": z.number()
}).partial();

export function PATCH(req: Request, { params }: Context) {
    return authenticatedAny(req, async (session) => {
        if (!session.user)
            return respondWithInit({
                message: "Could not find an authenticated user for this session! Please try logging in again.",
                status: 403
            });

        const body: UpdateRequestedStockItemDto = await req.json();
        const bodyValidated = updateRequestedStockItemDtoSchema.safeParse(body);
        if (!body || !bodyValidated.success)
            return respondWithInit({
                message: "Invalid payload!",
                validationErrors: bodyValidated,
                status: 400
            });

        const updatedItem = await prisma.requestedStockItem.update({
            where: {
                id: params.itemId,
                stockRequest: { requestedByUserId: session.user.id }
            },
            data: body
        });

        return NextResponse.json(updatedItem);
    }, [
        Permission.CREATE_INVENTORY,
        Permission.CREATE_STOCK_REQUEST,
        Permission.MANAGE_STOCK_REQUESTS,
        Permission.VIEW_STOCK_REQUESTS
    ]);
}

export function DELETE(req: Request, { params }: Context) {
    return authenticatedAny(req, async (session) => {
        if (!session.user)
            return respondWithInit({
                message: "Could not find an authenticated user for this session! Please try logging in again.",
                status: 403
            });

        const deletedItem = await prisma.requestedStockItem.delete({
            where: {
                id: params.itemId,
                stockRequest: { requestedByUserId: session.user.id }
            }
        });

        return NextResponse.json(deletedItem);
    }, [
        Permission.CREATE_INVENTORY,
        Permission.CREATE_STOCK_REQUEST,
        Permission.MANAGE_STOCK_REQUESTS,
        Permission.VIEW_STOCK_REQUESTS
    ]);
}