import { InvoiceItem } from "@prisma/client";
import { z } from "zod";

export type UpdateInvoiceItemDto = Omit<Partial<InvoiceItem>, "invoiceId" | "id" | "createdAt" | "updatedAt">

export const updateInvoiceItemDtoSchema = z.object({
    name: z.string(),
    description: z.string(),
    price: z.number(),
    quantity: z.number()
}).strict().partial();