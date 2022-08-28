import {StockItem} from "../../../types/InventoryCategoryObject";
import mongoose, {Schema} from "mongoose";
import Joi from "joi";

export interface IStockCategory {
    id: string,
    name: string,
    index: number,
    stock: StockItem
}

export const StockCategoryJoiSchema = Joi.object({
    id: Joi.string().required(),
    name: Joi.string().required(),
    index: Joi.number().required(),
    stock: Joi.array().items(Joi.object({
        uid: Joi.string().required(),
        name: Joi.string().required(),
        quantity: Joi.number().required(),
        lastUpdated: Joi.number().required()
    }))
});

const StockCategorySchema = new Schema<IStockCategory>({
    id: { type: String, required: true },
    name: { type: String, required: true },
    index: { type: Number, required: true },
    stock: { type: Object, required: true }
});

export default StockCategorySchema;
export const StockCategory = mongoose.models.stock || mongoose.model('stock', StockCategorySchema, 'stock');