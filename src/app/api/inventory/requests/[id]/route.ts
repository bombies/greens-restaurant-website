import { authenticatedAny, handleEitherResult } from "../../../../../utils/api/ApiUtils";
import Permission from "../../../../../libs/types/permission";
import { NextResponse } from "next/server";
import inventoryRequestsService from "../service";
import { AdminUpdateStockRequestDto } from "../types";
import selfUserService from "../me/service";

type Context = {
    params: {
        id: string
    }
}

export async function GET(req: Request, { params }: Context) {
    return authenticatedAny(req, async (session, _, userPermissions) => {
        const { withItems, withUsers, withAssignees } = selfUserService.getFetchStockRequestsSearchParams(req.url);
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