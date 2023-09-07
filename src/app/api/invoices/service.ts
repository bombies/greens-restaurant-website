import { Invoice } from "@prisma/client";
import prisma from "../../../libs/prisma";
import { InvoiceWithExtras } from "./types";

class InvoiceService {

    async fetchAllInvoices(): Promise<InvoiceWithExtras[]> {
        return prisma.invoice.findMany({
            include: {
                customer: true,
                invoiceItems: true
            }
        });
    }
}

const invoiceService = new InvoiceService();
export default invoiceService;