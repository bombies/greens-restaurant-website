import { authenticated, authenticatedAny, respondWithInit } from "../../../../../../utils/api/ApiUtils";
import Permission from "../../../../../../libs/types/permission";
import { fetchCustomerInfo } from "../route";
import { NextResponse } from "next/server";
import prisma from "../../../../../../libs/prisma";

type Context = {
    params: {
        id: string
    }
}

export function GET(req: Request, { params }: Context) {
    return authenticatedAny(req, async () => {
        const customer = await fetchCustomerInfo(params.id, true);
        if (customer.error)
            return customer.error;
        return NextResponse.json(customer.success);
    }, [Permission.CREATE_INVOICE, Permission.VIEW_INVOICES]);
}

export type CreateInvoiceDto = {
    title: string,
    description?: string
}

export function POST(req: Request, { params }: Context) {
    return authenticated(req, async () => {
        const customer = await fetchCustomerInfo(params.id);
        if (customer.error)
            return customer.error;

        const body = (await req.json()) as CreateInvoiceDto;
        if (!body)
            return respondWithInit({
                message: "You must provide a body for this request!",
                status: 401
            });

        const createdInvoice = await prisma.invoice.create({
            data: {
                title: body.title,
                description: body.description,
                customerId: customer.success!.id
            }
        });
        
        return NextResponse.json(createdInvoice);
    }, Permission.CREATE_INVOICE);
}
