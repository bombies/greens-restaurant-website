import { authenticatedAny, handleEitherResult } from "../../../../../../utils/api/ApiUtils";
import Permission from "../../../../../../libs/types/permission";
import { NextResponse } from "next/server";
import { ReviewInventoryRequestDto } from "../../types";
import inventoryRequestsService from "../../service";

type Context = {
    params: {
        id: string
    }
}

export async function POST(req: Request, { params }: Context) {
    return authenticatedAny(req, async (session) => {
        const body: ReviewInventoryRequestDto = (await req.json());
        const reviewResult = await inventoryRequestsService.review(session, params.id, body);
        return handleEitherResult(reviewResult);
    }, [
        Permission.CREATE_INVENTORY,
        Permission.MANAGE_STOCK_REQUESTS
    ]);
}