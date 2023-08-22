import { authenticatedAny, respondWithInit } from "../../../../../utils/api/ApiUtils";
import Permission from "../../../../../libs/types/permission";
import prisma from "../../../../../libs/prisma";
import { StockRequest } from "@prisma/client";
import { z } from "zod";
import { NextResponse } from "next/server";

type Context = {
    params: {
        id: string
    }
}

export type AdminUpdateStockRequestDto = Partial<Pick<StockRequest, "reviewed" | "rejected" | "reviewedNotes">>
const adminUpdateStockRequestDtoSchema = z.object({
    reviewed: z.boolean(),
    rejected: z.boolean(),
    reviewedNotes: z.string()
}).partial().strict();

export async function PATCH(req: Request, { params }: Context) {
    return authenticatedAny(req, async () => {
        const body: AdminUpdateStockRequestDto = (await req.json());
        const bodyValidated = adminUpdateStockRequestDtoSchema.safeParse(body);
        if (!body || !bodyValidated.success)
            return respondWithInit({
                message: "Invalid body!",
                validationErrors: bodyValidated,
                status: 401
            });

        const request = await prisma.stockRequest.findUnique({
            where: {
                id: params.id
            }
        });

        if (!request)
            return respondWithInit({
                message: `There was no request with the ID ${params.id}`,
                status: 401
            });

        const updatedRequest = await prisma.stockRequest.update({
            where: {
                id: params.id
            },
            data: body
        });

        return NextResponse.json(updatedRequest);
    }, [
        Permission.CREATE_INVENTORY,
        Permission.MANAGE_STOCK_REQUESTS
    ]);
}