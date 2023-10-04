import { authenticatedAny, handleEitherResult, respondWithInit } from "../../../../../utils/api/ApiUtils";
import Permission from "../../../../../libs/types/permission";
import prisma from "../../../../../libs/prisma";
import { NextResponse } from "next/server";
import { Prisma, RequestedStockItem, StockRequest } from "@prisma/client";
import { z } from "zod";
import StockRequestWhereInput = Prisma.StockRequestWhereInput;
import { StockRequestStatus } from ".prisma/client";
import { Mailer } from "../../../../../utils/api/mail/Mailer";
import inventoryRequestsService from "../service";
import { CreateStockRequestDto } from "../types";

export const getFetchStockRequestsSearchParams = (url: string) => {
    const { searchParams } = new URL(url);
    const status = searchParams.get("status")?.toLowerCase() as StockRequestStatus;
    const withItems = searchParams.get("with_items")?.toLowerCase() === "true" || false;
    const withUsers = searchParams.get("with_users")?.toLowerCase() === "true" || false;
    const withAssignees = searchParams.get("with_assignees")?.toLowerCase() === "true" || false;
    const from: number | undefined = searchParams.get("from") ? Number(searchParams.get("from")) : undefined;
    const to: number | undefined = searchParams.get("to") ? Number(searchParams.get("to")) : undefined;
    return { status, withItems, withUsers, withAssignees, from, to };
};

export async function GET(req: Request) {
    return authenticatedAny(req, async (session, _, userPermissions) => {
        const { status, withItems, withUsers, withAssignees } = getFetchStockRequestsSearchParams(req.url);
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