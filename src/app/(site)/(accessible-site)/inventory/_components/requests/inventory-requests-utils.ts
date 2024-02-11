import { Inventory, RequestedStockItem, Stock, StockRequest, StockSnapshot, User } from "@prisma/client";
import { InventoryWithOptionalExtras } from "../../../../../api/inventory/[name]/types";

export type StockSnapshotWithOptionalInventory = StockSnapshot & {
    inventory?: Inventory
}

export type StockRequestWithOptionalCreator = StockRequest & {
    requestedByUser?: User
}

export type StockRequestWithOptionalItems = StockRequest & {
    requestedItems?: (RequestedStockItem & { stock?: Stock & { inventory?: Inventory } })[]
}

export type StockRequestWithOptionalAssignees = StockRequest & {
    assignedToUsers?: User[]
}

export type StockRequestWithOptionalCreatorAndAssignees =
    StockRequestWithOptionalCreator
    & Pick<StockRequestWithOptionalAssignees, "assignedToUsers">

export type StockRequestWithOptionalCreatorAndItems =
    StockRequestWithOptionalCreator
    & Pick<StockRequestWithOptionalItems, "requestedItems">

export type StockRequestWithOptionalExtras =
    StockRequestWithOptionalCreatorAndItems
    & Pick<StockRequestWithOptionalAssignees, "assignedToUsers">
    & { reviewedByUser?: User, assignedLocation?: InventoryWithOptionalExtras }

export type RequestedStockItemWithOptionalStock = RequestedStockItem & {
    stock?: Stock
}

export type RequestedStockItemWithOptionalStockAndInventory = RequestedStockItem & {
    stock?: Stock
}

export type RequestedStockItemWithOptionalRequest = RequestedStockItem & {
    stockRequest?: StockRequest
}

export type RequestedStockItemWithOptionalStockAndRequest =
    RequestedStockItemWithOptionalStockAndInventory
    & Pick<RequestedStockItemWithOptionalRequest, "stockRequest">