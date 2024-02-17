import { Config } from "@prisma/client";
import { DeepPartial } from "react-hook-form";
import { z } from "zod";

export type UpdateConfigDto = { id: string } & DeepPartial<Omit<Config, "id" | "createdAt" | "updatedAt">>
export const UpdateConfigDtoSchema = z.object({
    id: z.string(),
    inventoryConfig: z.object({
        lowStockThresholds: z.object({
            flaskDrink: z.number(),
            imperialBottle: z.number(),
            quartBottle: z.number(),
            twelveCase: z.number(),
            twentyFourCase: z.number(),
            sixCase: z.number(),
            default: z.number()
        }).partial()
    }).partial().optional()
})