import { InventorySection, InventorySectionSnapshot, Stock, StockSnapshot, StockType } from "@prisma/client";
import { z } from "zod";
import { CreateStockDto } from "../../[name]/stock/route";
import { InventoryWithOptionalExtras, InventoryWithSections } from "../../[name]/types";

export type InventorySectionWithOptionalExtras = InventorySection & {
    inventory?: InventoryWithOptionalExtras,
    stock?: Stock[],
    assignedStock?: Stock[]
}

export type InventorySectionSnapshotWithOptionalExtras = InventorySectionSnapshot & {
    inventorySection?: InventorySectionWithOptionalExtras,
    stockSnapshots?: StockSnapshot[]
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

export type BarSnapshot = {
    createdAt: Date,
    data: InventorySectionSnapshotWithOptionalExtras[],
}
