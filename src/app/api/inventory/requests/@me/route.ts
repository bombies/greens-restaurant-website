import { authenticatedAny, respondWithInit } from "../../../../../utils/api/ApiUtils";
import Permission from "../../../../../libs/types/permission";
import prisma from "../../../../../libs/prisma";
import { NextResponse } from "next/server";
import { StockRequest } from "@prisma/client";
import { z } from "zod";

export async function GET(req: Request) {
    return authenticatedAny(req, async (session) => {
        const { searchParams } = new URL(req.url);
        const reviewed = searchParams.get("reviewed")?.toLowerCase() === "true" ? (searchParams.get("reviewed")?.toLowerCase() === "false" ? false : undefined) : true;
        const rejected = searchParams.get("rejected")?.toLowerCase() === "true" ? (searchParams.get("rejected")?.toLowerCase() === "false" ? false : undefined) : true;

        const requests = await prisma.stockRequest.findMany({
            where: {
                requestedByUserId: session.user?.id,
                reviewed,
                rejected
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

export type CreateStockRequestDto = Omit<StockRequest, "id" | "createdAt" | "updatedAt" | "requestedByUserId" | "reviewed" | "rejected">
const createStockRequestSchemaDto = z.object({
    stockIds: z.array(z.string())
});

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

        const createdRequest = await prisma.stockRequest.create({
            data: {
                rejected: false,
                reviewed: false,
                requestedByUserId: session.user.id,
                ...body
            }
        });

        // TODO: Email any assigned users about the newly created request

        return NextResponse.json(createdRequest);
    }, [Permission.CREATE_INVENTORY, Permission.CREATE_STOCK_REQUEST, Permission.MANAGE_STOCK_REQUESTS]);
}