export type InventoryCategory = {
    name: string,
    index: number,
    stock: StockItem[]
}

export type StockItem = {
    uid: string,
    name: string,
    quantity: number,
    lastUpdated: number
}