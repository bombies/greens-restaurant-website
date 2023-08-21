import { authenticatedAny } from "../../../../utils/api/ApiUtils";
import Permission from "../../../../libs/types/permission";
import prisma from "../../../../libs/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    return authenticatedAny(req, async () => {
        const { searchParams } = new URL(req.url);
        const reviewed = searchParams.get("reviewed")?.toLowerCase() === "true" ? (searchParams.get("reviewed")?.toLowerCase() === "false" ? false : undefined) : true;
        const rejected = searchParams.get("rejected")?.toLowerCase() === "true" ? (searchParams.get("rejected")?.toLowerCase() === "false" ? false : undefined) : true;

        const requests = await prisma.stockRequest.findMany({
            where: {
                reviewed,
                rejected
            }
        });
        return NextResponse.json(requests);
    }, [Permission.VIEW_STOCK_REQUESTS, Permission.MANAGE_STOCK_REQUESTS, Permission.CREATE_INVENTORY]);
}