import { InventorySection, InventorySectionSnapshot, Stock, StockSnapshot, StockType } from "@prisma/client";
import { z } from "zod";
import { InventoryWithOptionalExtras } from "../../[name]/utils";
import { CreateStockDto } from "../../[name]/stock/route";

export type InventorySectionWithOptionalExtras = InventorySection & {
    inventory?: InventoryWithOptionalExtras,
    stock?: Stock[]
}

export type InventorySectionSnapshotWithOptionalExtras = InventorySectionSnapshot & {
    inventorySection?: InventorySectionWithOptionalExtras,
    stockSnapshots?: (StockSnapshot & { stock?: Stock })[]
}

export type CreateInventorySectionDto = {
    name: string
}

export const createInventorySectionDtoSchema = z.object({
    name: z.string()
}).strict();

export type UpdateInventorySectionDto = {
    name: string
}

export const updateInventorySectionDtoSchema = z.object({
    name: z.string()
}).strict();

export interface CreateBarSectionStockItem extends CreateStockDto {
    type?: StockType;
}
