import { authenticatedAny, respondWithInit } from "../../../../../utils/api/ApiUtils";
import Permission from "../../../../../libs/types/permission";
import prisma from "../../../../../libs/prisma";
import { NextResponse } from "next/server";
import { RequestedStockItem, StockRequest } from "@prisma/client";
import { z } from "zod";

export const getFetchStockRequestsSearchParams = (url: string) => {
    const { searchParams } = new URL(url);
    const reviewed = searchParams.get("reviewed")?.toLowerCase() === "true" ? (searchParams.get("reviewed")?.toLowerCase() === "false" ? false : undefined) : true;
    const rejected = searchParams.get("rejected")?.toLowerCase() === "true" ? (searchParams.get("rejected")?.toLowerCase() === "false" ? false : undefined) : true;
    const withItems = searchParams.get("with_items")?.toLowerCase() === "true" || false;
    return { reviewed, rejected, withItems };
};

export async function GET(req: Request) {
    return authenticatedAny(req, async (session) => {
        const { rejected, reviewed, withItems } = getFetchStockRequestsSearchParams(req.url);
        const requests = await prisma.stockRequest.findMany({
            where: {
                AND: [
                    { requestedByUserId: session.user?.id },
                    { reviewed },
                    { rejected }
                ]
            },
            include: {
                requestedItems: withItems
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
    items: Pick<RequestedStockItem, "amountRequested" | "stockSnapshotId">[]
}

export const createStockRequestSchemaDto = z.object({
    assignedToUsersId: z.array(z.string()).optional(),
    items: z.array(z.object({
        amountRequested: z.number(),
        stockSnapshotId: z.string()
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
                status: 401
            });

        const validStockSnapshotsIds = (await prisma.stockSnapshot.findMany({
            where: {
                id: {
                    in: body.items.map(item => item.stockSnapshotId)
                }
            },
            select: { id: true }
        })).map(item => item.id);

        const createdRequest = await prisma.stockRequest.create({
            data: {
                rejected: false,
                reviewed: false,
                requestedByUserId: session.user.id,
                assignedToUsersId: body.assignedToUsersId
            }
        });

        const itemsToBeCreated = body.items
            .filter(item => validStockSnapshotsIds.includes(item.stockSnapshotId))
            .map(item => ({ ...item, stockRequestId: createdRequest.id }));

        const createdRequestedStockItems = await prisma.requestedStockItem.createMany({
            data: itemsToBeCreated
        });

        // TODO: Email any assigned users about the newly created request

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
                status: 401
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