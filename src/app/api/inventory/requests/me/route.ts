import { authenticatedAny, respondWithInit } from "../../../../../utils/api/ApiUtils";
import Permission from "../../../../../libs/types/permission";
import prisma from "../../../../../libs/prisma";
import { NextResponse } from "next/server";
import { Prisma, RequestedStockItem, StockRequest } from "@prisma/client";
import { z } from "zod";
import StockRequestWhereInput = Prisma.StockRequestWhereInput;
import { StockRequestStatus } from ".prisma/client";
import { Mailer } from "../../../../../utils/api/Mailer";

export const getFetchStockRequestsSearchParams = (url: string) => {
    const { searchParams } = new URL(url);
    const status = searchParams.get("status")?.toLowerCase() as StockRequestStatus;
    const withItems = searchParams.get("with_items")?.toLowerCase() === "true" || false;
    const withUsers = searchParams.get("with_users")?.toLowerCase() === "true" || false;
    const withAssignees = searchParams.get("with_assignees")?.toLowerCase() === "true" || false;
    return { status, withItems, withUsers, withAssignees };
};

export async function GET(req: Request) {
    return authenticatedAny(req, async (session) => {
        const { status, withItems, withUsers, withAssignees } = getFetchStockRequestsSearchParams(req.url);

        let whereQuery: StockRequestWhereInput = {
            requestedByUserId: session.user!.id
        };

        if (status !== undefined)
            whereQuery = {
                ...whereQuery,
                status
            };

        const requests = await prisma.stockRequest.findMany({
            where: whereQuery,
            include: {
                requestedItems: withItems,
                requestedByUser: withUsers,
                assignedToUsers: withAssignees
            }
        });
        return NextResponse.json(requests);
    }, [
        Permission.CREATE_INVENTORY,
        Permission.CREATE_STOCK_REQUEST,
        Permission.VIEW_STOCK_REQUESTS,
        Permission.MANAGE_STOCK_REQUESTS
    ]);
}

export type CreateStockRequestDto = Pick<StockRequest, "assignedToUsersId"> & {
    items: Pick<RequestedStockItem, "amountRequested" | "stockId">[]
}

export const createStockRequestSchemaDto = z.object({
    assignedToUsersId: z.array(z.string()).optional(),
    items: z.array(z.object({
        amountRequested: z.number(),
        stockId: z.string()
    }))
}).strict();

export async function POST(req: Request) {
    return authenticatedAny(req, async (session) => {
        if (!session.user)
            return respondWithInit({
                message: "Could not find an authenticated user for this session! Please try logging in again.",
                status: 403
            });

        const body: CreateStockRequestDto = (await req.json());
        const bodyValidated = createStockRequestSchemaDto.safeParse(body);
        if (!body || !bodyValidated)
            return respondWithInit({
                message: "Invalid payload!",
                validationErrors: bodyValidated,
                status: 400
            });

        const validStockIds = (await prisma.stock.findMany({
            where: {
                id: {
                    in: body.items.map(item => item.stockId)
                }
            },
            select: { id: true }
        })).map(item => item.id);

        const createdRequest = await prisma.stockRequest.create({
            data: {
                status: StockRequestStatus.PENDING,
                requestedByUserId: session.user.id,
                assignedToUsersId: body.assignedToUsersId
            },
            include: {
                requestedByUser: true,
                assignedToUsers: true
            }
        });

        const itemsToBeCreated = body.items
            .filter(item => validStockIds.includes(item.stockId))
            .map(item => ({ ...item, stockRequestId: createdRequest.id }));

        const createdRequestedStockItems = await prisma.requestedStockItem.createMany({
            data: itemsToBeCreated
        }).then(() => prisma.requestedStockItem.findMany({
            where: {
                stockRequestId: createdRequest.id
            },
            include: {
                stock: true
            }
        }));

        await prisma.user.updateMany({
            where: {
                id: { in: body.assignedToUsersId }
            },
            data: {
                assignedStockRequestsIds: {
                    push: createdRequest.id
                }
            }
        });

        await Mailer.sendInventoryRequestAssignment({
            assignees: createdRequest.assignedToUsers,
            request: { ...createdRequest, requestedItems: createdRequestedStockItems }
        });

        return NextResponse.json({ ...createdRequest, requestedItems: createdRequestedStockItems });
    }, [
        Permission.CREATE_INVENTORY,
        Permission.CREATE_STOCK_REQUEST,
        Permission.MANAGE_STOCK_REQUESTS,
        Permission.VIEW_STOCK_REQUESTS
    ]);
}

// Bulk delete requests made by authenticated user
export async function DELETE(req: Request) {
    return authenticatedAny(req, async (session) => {
        const { searchParams } = new URL(req.url);
        const idsToBeDeleted = searchParams.get("ids");
        if (!idsToBeDeleted)
            return respondWithInit({
                message: "You must provide an \"ids\" search parameter which contains a comma separated list of request ids to delete!",
                status: 400
            });

        const ids = idsToBeDeleted.replaceAll(/\s/g, "").split(",");
        const deletedBatch = await prisma.stockRequest.deleteMany({
            where: {
                AND: [
                    { id: { in: ids } },
                    { requestedByUserId: session.user!.id }
                ]
            }
        });

        return NextResponse.json(deletedBatch);
    }, [
        Permission.CREATE_INVENTORY,
        Permission.CREATE_STOCK_REQUEST,
        Permission.MANAGE_STOCK_REQUESTS,
        Permission.VIEW_STOCK_REQUESTS
    ]);
}