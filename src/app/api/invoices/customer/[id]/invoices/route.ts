import { authenticated, authenticatedAny } from "../../../../../../utils/api/ApiUtils";
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
        const { searchParams } = new URL(req.url);
        const withInvoices = searchParams.get("with_invoices")?.toLowerCase() === "true";
        const withItems = searchParams.get("with_items")?.toLowerCase() === "true";
        const customer = await fetchCustomerInfo(params.id, withInvoices, withItems);
        if (customer.error)
            return customer.error;
        return NextResponse.json(customer.success);
    }, [Permission.CREATE_INVOICE, Permission.VIEW_INVOICES]);
}

export function POST(req: Request, { params }: Context) {
    return authenticated(req, async () => {
        const { success: customerInfo, error } = await fetchCustomerInfo(params.id, true);
        if (error)
            return error;

        const invoiceNumber = (await prisma.invoice.count()) + 1;
        const createdInvoice = await prisma.invoice.create({
            data: {
                number: invoiceNumber,
                customerId: customerInfo!.id
            }
        });

        return NextResponse.json(createdInvoice);
    }, Permission.CREATE_INVOICE);
}
