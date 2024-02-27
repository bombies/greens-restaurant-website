import { z } from "zod";
import {
    Inventory,
    InventorySection,
    InventorySectionSnapshot,
    InventorySnapshot,
    Stock,
    StockSnapshot, StockType
} from "@prisma/client";
import { InventoryType } from ".prisma/client";
import { InventorySectionWithOptionalExtras } from "../location/[name]/types";

export type CreateInventoryDto = {
    name: string,
    type?: InventoryType
    createdBy?: string,
}

export type InventoryWithSections = Inventory & {
    inventorySections: InventorySection[]
}

export type InventoryWithOptionalExtras = Inventory & {
    stock?: Stock[],
    snapshots?: InventorySnapshot[],
    inventorySections?: (InventorySection & { assignedStock?: Stock[] })[],
    lowStock?: StockSnapshot[]
}

export type InventorySnapshotWithOptionalExtras = InventorySnapshot & {
    inventory?: Inventory & {
        stock?: Stock[]
    },
    stockSnapshots?: StockSnapshot[]
}

export type InventorySnapshotWithExtras = InventorySnapshot & {
    inventory: Inventory & {
        stock: Stock[]
    },
    stockSnapshots: StockSnapshot[]
}

export type InventorySectionSnapshotWithExtras = InventorySectionSnapshot & {
    inventorySection: InventorySection & {
        stock: Stock[]
    },
    stockSnapshots: StockSnapshot[]
}

export type InventorySnapshotWithStockSnapshots = InventorySnapshot & {
    stockSnapshots: StockSnapshot[]
}

export type StockWithOptionalExtras = Stock & {
    inventory?: InventoryWithOptionalExtras,
    inventorySection?: InventorySectionWithOptionalExtras
}

export const createInventoryDtoSchema = z.object({
    name: z.string(),
    createdBy: z.string().optional(),
    type: z.nativeEnum(InventoryType).optional()
}).strict();

export const updateStockItemDtoSchema = z.object({
    name: z.string(),
    quantity: z.number(),
    price: z.number(),
    type: z.nativeEnum(StockType)
}).partial().strict();

export const updateCurrentStockSnapshotSchema = z.object({
    name: z.string(),
    quantity: z.number().int().gte(0),
    price: z.number().gte(0),
    sellingPrice: z.number().gte(0),
    type: z.string()
}).partial().strict();