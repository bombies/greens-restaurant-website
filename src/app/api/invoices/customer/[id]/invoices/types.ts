import { InvoiceType } from "@prisma/client";
import { z } from "zod";

export type CreateInvoiceDto = {
    type?: InvoiceType
}

export const CreateInvoiceSchema = z.object({
    type: z.nativeEnum(InvoiceType)
}).strict()