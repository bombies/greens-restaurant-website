import { Inventory, RequestedStockItem, StockRequest, StockSnapshot, User } from "@prisma/client";

export type StockSnapshotWithOptionalInventory = StockSnapshot & {
    inventory?: Inventory
}

export type StockRequestWithOptionalCreator = StockRequest & {
    requesterByUser?: User
}

export type StockRequestWithOptionalItems = StockRequest & {
    requestedItems?: RequestedStockItem[]
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