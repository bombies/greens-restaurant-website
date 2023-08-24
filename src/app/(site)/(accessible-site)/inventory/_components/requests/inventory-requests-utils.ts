import { Inventory, RequestedStockItem, StockRequest, StockSnapshot, User } from "@prisma/client";

export type StockSnapshotWithOptionalInventory = StockSnapshot & {
    inventory?: Inventory
}

export type StockRequestWithOptionalCreator = StockRequest & {
    requestedByUser?: User
}

export type StockRequestWithOptionalItems = StockRequest & {
    requestedItems?: RequestedStockItem[]
}

export type StockRequestWithOptionalAssignees = StockRequest & {
    assignedToUsers?: User[]
}

export type StockRequestWithOptionalCreatorAndItems =
    StockRequestWithOptionalCreator
    & Pick<StockRequestWithOptionalItems, "requestedItems">

export type RequestedStockItemWithOptionalSnapshot = RequestedStockItem & {
    stockSnapshot?: StockSnapshot
}

export type RequestedStockItemWithOptionalSnapshotAndInventory = RequestedStockItem & {
    stockSnapshot?: StockSnapshotWithOptionalInventory
}

export type RequestedStockItemWithOptionalRequest = RequestedStockItem & {
    stockRequest?: StockRequest
}

export type RequestedStockItemWithOptionalSnapshotAndRequest =
    RequestedStockItemWithOptionalSnapshotAndInventory
    & Pick<RequestedStockItemWithOptionalRequest, "stockRequest">