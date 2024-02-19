import { Inventory, RequestedStockItem, Stock, StockRequest, User } from "@prisma/client";
import { z } from "zod";
import { InventoryWithOptionalExtras, StockWithOptionalExtras } from "../[name]/types";
import {
    StockRequestWithOptionalAssignees,
    StockRequestWithOptionalCreatorAndItems
} from "../../../(site)/(accessible-site)/inventory/_components/requests/inventory-requests-utils";

export type RequestStockItemWithStockAndOptionalInventory = RequestedStockItem & {
    stock: Stock & {
        inventory: Inventory | null
    }
}

export type InventoryWithRequestedStockItems = {
    inventory: Inventory,
    items: (RequestedStockItem & { stock: Stock })[]
}

export type StockRequestWithOptionalExtras = StockRequestWithOptionalCreatorAndItems
    & Pick<StockRequestWithOptionalAssignees, "assignedToUsers">
    & {
    reviewedByUser?: User,
    assignedLocation?: InventoryWithOptionalExtras,
    requestedItems: RequestedStockItemWithOptionalExtras[]
}

export type RequestedStockItemWithOptionalExtras = RequestedStockItem & {
    stock?: Omit<StockWithOptionalExtras, "inventory"> & { inventory?: InventoryWithOptionalExtras | null },
    stockRequest?: StockRequestWithOptionalExtras
}

export type ReviewInventoryRequestItem = {
    id: string,
    amountProvided: number,
    amountRequested: number,
}

export type ReviewInventoryRequestDto = {
    reviewedNotes?: string,
    deliveredAt: string,
    items: ReviewInventoryRequestItem[]
}

export const reviewInventoryRequestDtoSchema = z.object({
    reviewedNotes: z.string().optional(),
    items: z.array(z.object({
        id: z.string(),
        amountProvided: z.number()
    })),
    deliveredAt: z.string().datetime()
}).passthrough();

export type AdminUpdateStockRequestDto = Partial<Pick<StockRequest, "status" | "reviewedNotes">>

export const adminUpdateStockRequestDtoSchema = z.object({
    status: z.string(),
    reviewedNotes: z.string()
}).partial().strict();

export type CreateStockRequestDto = Pick<StockRequest, "assignedToUsersId" | "assignedLocationId"> & {
    items: Pick<RequestedStockItem, "amountRequested" | "stockId" | "stockUID">[]
}

export const createStockRequestSchemaDto = z.object({
    assignedToUsersId: z.array(z.string()).optional(),
    assignedLocationId: z.string().nonempty("The location ID must be provided!"),
    items: z.array(z.object({
        amountRequested: z.number(),
        stockId: z.string(),
        stockUID: z.string()
    }))
}).strict();