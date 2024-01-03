import { Invoice, InvoiceItem } from "@prisma/client";
import { z } from "zod";

export type CreateInvoiceItemsDto = Omit<InvoiceItem, "id" | "createdAt" | "updatedAt" | "invoiceId">[]

export const createInvoiceDtoSchema = z.array(z.object({
    name: z.string(),
    description: z.string().optional(),
    price: z.number(),
    quantity: z.number()
}).strict());

export type UpdateInvoiceDto = Partial<Omit<Invoice, "createdAt" | "updatedAt" | "customerId" | "id" | "number">>;

export const updateInvoiceDtoSchema = z.object({
    description: z.string(),
    paid: z.boolean(),
    dueAt: z.date().or(z.string())
}).partial().strict();