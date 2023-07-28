import { authenticatedAny } from "../../../../../../utils/api/ApiUtils";
import Permission from "../../../../../../libs/types/permission";
import prisma from "../../../../../../libs/prisma";
import { NextResponse } from "next/server";

type Context = {
    params: {
        id: string
    }
}

export async function GET(req: Request, { params }: Context) {
    return authenticatedAny(req, async () => {
        return NextResponse.json(await prisma.invoice.count({
            where: {
                customerId: params.id
            }
        }));
    }, [Permission.VIEW_INVOICES, Permission.CREATE_INVOICE]);
}