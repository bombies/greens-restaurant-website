import {StockItem} from "../../../types/InventoryCategoryObject";
import {Schema} from "mongoose";

export interface IStockCategory {
    id: string,
    name: string,
    index: number,
    stock: StockItem
}

const StockCategorySchema = new Schema<IStockCategory>({
    id: { type: String, required: true },
    name: { type: String, required: true },
    index: { type: Number, required: true },
    stock: { type: Object, required: true }
})