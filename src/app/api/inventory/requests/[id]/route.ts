import { authenticatedAny, handleEitherResult, respondWithInit } from "../../../../../utils/api/ApiUtils";
import Permission, { hasAnyPermission } from "../../../../../libs/types/permission";
import prisma from "../../../../../libs/prisma";
import { StockRequest } from "@prisma/client";
import { z } from "zod";
import { NextResponse } from "next/server";
import { getFetchStockRequestsSearchParams } from "../me/route";
import inventoryRequestsService from "../service";
import { AdminUpdateStockRequestDto } from "../types";

type Context = {
    params: {
        id: string
    }
}

export async function GET(req: Request, { params }: Context) {
    return authenticatedAny(req, async (session, _, userPermissions) => {
        const { withItems, withUsers, withAssignees } = getFetchStockRequestsSearchParams(req.url);
        const fetchResult = await inventoryRequestsService.fetchRequest(params.id, session.user!.id, userPermissions, {
            withItems, withAssignees, withUsers
        });
        return NextResponse.json(fetchResult);
    }, [
        Permission.CREATE_INVENTORY,
        Permission.CREATE_STOCK_REQUEST,
        Permission.VIEW_STOCK_REQUESTS,
        Permission.MANAGE_STOCK_REQUESTS
    ]);
}

export async function PATCH(req: Request, { params }: Context) {
    return authenticatedAny(req, async () => {
        const body: AdminUpdateStockRequestDto = (await req.json());
        const updateResult = await inventoryRequestsService.adminUpdateRequest(params.id, body);
        return handleEitherResult(updateResult);
    }, [
        Permission.CREATE_INVENTORY,
        Permission.MANAGE_STOCK_REQUESTS
    ]);
}