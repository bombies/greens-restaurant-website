import { authenticatedAny, respondWithInit } from "../../../../../utils/api/ApiUtils";
import Permission, { hasAnyPermission } from "../../../../../libs/types/permission";
import prisma from "../../../../../libs/prisma";
import { StockRequest } from "@prisma/client";
import { z } from "zod";
import { NextResponse } from "next/server";
import { getFetchStockRequestsSearchParams } from "../me/route";

type Context = {
    params: {
        id: string
    }
}

export async function GET(req: Request, { params }: Context) {
    return authenticatedAny(req, async (session, _, userPermissions) => {
        const { withItems, withUsers, withAssignees } = getFetchStockRequestsSearchParams(req.url);
        const andArr: any[] = [{ id: params.id }];
        if (!hasAnyPermission(userPermissions, [
            Permission.CREATE_INVENTORY,
            Permission.VIEW_STOCK_REQUESTS,
            Permission.MANAGE_STOCK_REQUESTS
        ]))
            andArr.push({ requestedByUserId: session.user!.id });

        const request = await prisma.stockRequest.findFirst({
            where: {
                AND: andArr
            },
            include: {
                requestedItems: withItems && {
                    include: {
                        stock: true
                    }
                },
                requestedByUser: withUsers,
                assignedToUsers: withAssignees
            }
        });
        return NextResponse.json(request);
    }, [
        Permission.CREATE_INVENTORY,
        Permission.CREATE_STOCK_REQUEST,
        Permission.VIEW_STOCK_REQUESTS,
        Permission.MANAGE_STOCK_REQUESTS
    ]);
}

export type AdminUpdateStockRequestDto = Partial<Pick<StockRequest, "status" | "reviewedNotes">>
const adminUpdateStockRequestDtoSchema = z.object({
    status: z.string(),
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