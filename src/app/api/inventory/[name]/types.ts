import { z } from "zod";
import {
    Inventory,
    InventorySection,
    InventorySectionSnapshot,
    InventorySnapshot,
    Stock,
    StockSnapshot
} from "@prisma/client";

export type InventoryWithSections = Inventory & {
    inventorySections: InventorySection[]
}

export type InventoryWithOptionalExtras = Inventory & {
    stock?: Stock[],
    snapshots?: InventorySnapshot[],
    inventorySections?: InventorySection[]
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

export const updateStockItemDtoSchema = z.object({
    name: z.string(),
    quantity: z.number(),
    price: z.number()
}).partial().strict();

export const updateCurrentStockSnapshotSchema = z.object({
    name: z.string(),
    quantity: z.number().int().gte(0),
    price: z.number().gte(0),
    type: z.string()
}).partial().strict();