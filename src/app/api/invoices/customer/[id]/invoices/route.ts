import { authenticated, authenticatedAny } from "../../../../../../utils/api/ApiUtils";
import Permission from "../../../../../../libs/types/permission";
import { NextResponse } from "next/server";
import prisma from "../../../../../../libs/prisma";
import specificCustomerService from "../service";

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
        const customer = await specificCustomerService(params.id).fetchCustomerInfo(withInvoices, withItems);
        if (customer.error)
            return customer.error;
        return NextResponse.json(customer.success);
    }, [Permission.CREATE_INVOICE, Permission.VIEW_INVOICES]);
}

export function POST(req: Request, { params }: Context) {
    return authenticated(req, async () => {
        const { success: customerInfo, error } = await specificCustomerService(params.id).fetchCustomerInfo(true);
        if (error)
            return error;

        const invoiceNumber = (await prisma.invoice.count()) + 1;
        const createdInvoice = await prisma.invoice.create({
            data: {
                number: invoiceNumber,
                customerId: customerInfo!.id
            },
            include: {
                invoiceItems: true
            }
        });

        return NextResponse.json(createdInvoice);
    }, Permission.CREATE_INVOICE);
}
