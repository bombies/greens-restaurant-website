import { authenticated, authenticatedAny } from "../../../../../../utils/api/ApiUtils";
import Permission from "../../../../../../libs/types/permission";
import { NextResponse } from "next/server";
import prisma from "../../../../../../libs/prisma";
import specificCustomerService from "../service";
import { CreateInvoiceDto, CreateInvoiceSchema } from "./types";
import { buildFailedValidationResponse } from "../../../../utils/utils";
import { InvoiceType } from "@prisma/client";

type Context = {
    params: {
        id: string
    }
}

export function GET(req: Request, { params }: Context) {
    return authenticatedAny(req, async () => {
        const { searchParams } = new URL(req.url);
        const withInvoices = searchParams.get("with_invoices")?.toLowerCase() === "true";
        const withItems = searchParams.get("with_items")?.toLowerCase() === "true";
        const customerResponse = await specificCustomerService(params.id).fetchCustomerInfo(withInvoices, withItems);
        if (customerResponse.status !== 200)
            return customerResponse;
        return NextResponse.json(await customerResponse.json());
    }, [Permission.CREATE_INVOICE, Permission.VIEW_INVOICES]);
}

export function POST(req: Request, { params }: Context) {
    return authenticated(req, async () => {
        const body = (await req.json()) as CreateInvoiceDto | undefined;
        const bodyValidated = CreateInvoiceSchema.safeParse(body);
        if (body && !bodyValidated.success)
            return buildFailedValidationResponse(bodyValidated.error);
        return await specificCustomerService(params.id).createInvoice(body?.type);
    }, Permission.CREATE_INVOICE);
}
