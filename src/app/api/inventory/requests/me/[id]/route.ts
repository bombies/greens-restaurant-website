import { authenticatedAny, respondWithInit } from "../../../../../../utils/api/ApiUtils";
import Permission from "../../../../../../libs/types/permission";
import prisma from "../../../../../../libs/prisma";
import { NextResponse } from "next/server";
import { getFetchStockRequestsSearchParams } from "../route";
import { RequestedStockItem, StockRequest } from "@prisma/client";
import { z } from "zod";
import { StockRequestStatus } from ".prisma/client";

type Context = {
    params: {
        id: string,
    }
}

export async function GET(req: Request, { params }: Context) {
    return authenticatedAny(req, async (session) => {
        const { withItems } = getFetchStockRequestsSearchParams(req.url);
        const request = await prisma.stockRequest.findFirst({
            where: {
                AND: [
                    {
                        requestedByUserId: session.user?.id
                    },
                    {
                        id: params.id
                    }
                ]
            },
            include: {
                requestedItems: withItems
            }
        });
        return NextResponse.json(request);
    }, [
        Permission.CREATE_INVENTORY,
        Permission.CREATE_STOCK_REQUEST,
        Permission.MANAGE_STOCK_REQUESTS,
        Permission.VIEW_STOCK_REQUESTS
    ]);
}

export type CreateRequestedStockItemsDto = Pick<RequestedStockItem, "amountRequested" | "stockId">[]
const createRequestedStockItemsDto = z.array(z.object({
    amountRequested: z.number(),
    stockId: z.string()
}));

export async function POST(req: Request, { params }: Context) {
    return authenticatedAny(req, async () => {
        const body: CreateRequestedStockItemsDto = await req.json();
        const bodyValidated = createRequestedStockItemsDto.safeParse(body);
        if (!bodyValidated.success)
            return respondWithInit({
                message: "Invalid paylod!",
                validationErrors: bodyValidated,
                status: 401
            });

        const createdItems = await prisma.requestedStockItem.createMany({
            data: body
        }).then(() => prisma.requestedStockItem.findMany({
            where: {
                stockId: {
                    in: body.map(item => item.stockId)
                }
            },
            include: {
                stock: true
            }
        }));

        return NextResponse.json(createdItems);
    }, [
        Permission.CREATE_INVENTORY,
        Permission.CREATE_STOCK_REQUEST,
        Permission.MANAGE_STOCK_REQUESTS,
        Permission.VIEW_STOCK_REQUESTS
    ]);
}

export type UpdateStockRequestDto = Partial<Pick<StockRequest, "assignedToUsersId">>
const updateStockRequestDtoSchema = z.object({
    assignedToUsersId: z.array(z.string()).optional()
}).partial();

export async function PATCH(req: Request, { params }: Context) {
    return authenticatedAny(req, async (session) => {
        if (!session.user)
            return respondWithInit({
                message: "Could not find an authenticated user for this session! Please try logging in again.",
                status: 403
            });

        const body: UpdateStockRequestDto = (await req.json());
        const bodyValidated = updateStockRequestDtoSchema.safeParse(body);
        if (!body || !bodyValidated.success)
            return respondWithInit({
                message: "Invalid body!",
                validationErrors: bodyValidated,
                status: 401
            });

        let updatedRequest = await prisma.stockRequest.update({
            where: {
                id: params.id,
                requestedByUserId: session.user.id
            },
            data: {
                assignedToUsersId: body.assignedToUsersId
            }
        });
        return NextResponse.json(updatedRequest);
    }, [
        Permission.CREATE_INVENTORY,
        Permission.CREATE_STOCK_REQUEST,
        Permission.MANAGE_STOCK_REQUESTS,
        Permission.VIEW_STOCK_REQUESTS
    ]);
}

export async function DELETE(req: Request, { params }: Context) {
    return authenticatedAny(req, async (session) => {
        if (!session.user)
            return respondWithInit({
                message: "Could not find an authenticated user for this session! Please try logging in again.",
                status: 403
            });

        const request = await prisma.stockRequest.findUnique({
            where: {
                id: params.id
            }
        });

        if (!request)
            return respondWithInit({
                message: `There is no request with ID ${params.id}`,
                status: 404
            });

        if (request.status === StockRequestStatus.DELIVERED || request.status === StockRequestStatus.PARTIALLY_DELIVERED)
            return respondWithInit({
                message: "You cannot delete a delivered request!"
            });

        const deletedRequest = await prisma.stockRequest.delete({
            where: {
                id: params.id,
                requestedByUserId: session.user.id
            }
        });

        return NextResponse.json(deletedRequest);
    }, [
        Permission.CREATE_INVENTORY,
        Permission.CREATE_STOCK_REQUEST,
        Permission.MANAGE_STOCK_REQUESTS,
        Permission.VIEW_STOCK_REQUESTS
    ]);
}