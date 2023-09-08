import { authenticatedAny } from "../../../utils/api/ApiUtils";
import Permission from "../../../libs/types/permission";
import { NextResponse } from "next/server";
import invoiceService from "./service";

export async function GET(req: Request) {
    return authenticatedAny(req, async () => {
        return NextResponse.json(await invoiceService.fetchAllInvoices());
    }, [
        Permission.VIEW_INVOICES,
        Permission.CREATE_INVOICE
    ]);
}