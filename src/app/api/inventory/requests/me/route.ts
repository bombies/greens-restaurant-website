import { authenticatedAny, handleEitherResult, respondWithInit } from "../../../../../utils/api/ApiUtils";
import Permission from "../../../../../libs/types/permission";
import prisma from "../../../../../libs/prisma";
import { NextResponse } from "next/server";
import inventoryRequestsService from "../service";
import { CreateStockRequestDto } from "../types";
import selfUserService from "./service";

export async function GET(req: Request) {
    return authenticatedAny(req, async (session, _, userPermissions) => {
        const { status, withItems, withUsers, withAssignees } = selfUserService.getFetchStockRequestsSearchParams(req.url);
        const fetchResults = await inventoryRequestsService.fetchRequests(session.user!.id, userPermissions, {
            withUsers, withAssignees, withItems, status
        });
        return NextResponse.json(fetchResults);
    }, [
        Permission.CREATE_INVENTORY,
        Permission.CREATE_STOCK_REQUEST,
        Permission.VIEW_STOCK_REQUESTS,
        Permission.MANAGE_STOCK_REQUESTS
    ]);
}

export async function POST(req: Request) {
    return authenticatedAny(req, async (session) => {
        const body: CreateStockRequestDto = (await req.json());
        const createdResult = await inventoryRequestsService.createRequest(session.user!.id, body);
        return handleEitherResult(createdResult);
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