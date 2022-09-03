import createDBConnection from "../../../../database/mongo/db";
import { Config } from "../../../../database/mongo/schemas/Config";
import {
    StockCategory,
    IStockCategory,
} from "../../../../database/mongo/schemas/StockCategories";
import { StockItem } from "../../../../types/InventoryCategoryObject";
import { UserPermissions } from "../../../../types/UserPermissions";
import { authenticated } from "../../../../utils/api/auth";
import { handleInvalidHTTPMethod } from "../../../../utils/GeneralUtils";
import { generateDefaultConfig } from "../../management";

const handler = authenticated(async (req, res) => {
    const { method, query } = req;
    const { id } = query;

    switch (method) {
        case "GET": {
            await createDBConnection();
            let config = (await Config.find())[0];
            if (!config) config = await Config.create(generateDefaultConfig());
            const category = await StockCategory.findOne({ id: id });

            if (!category)
                return res
                    .status(404)
                    .json({ error: `There was no category with ID: ${id}` });

            let result: { id: string; name: string; stock: StockItem[] } = {
                id: category.id,
                name: category.name,
                stock: []
            };
            
            category.stock.forEach((item: StockItem) => {
                if (item.quantity < config.stockWarningMinimum)
                    result.stock.push(item);
            });

            return res.status(200).json(result);
        }
        default: {
            return handleInvalidHTTPMethod(res, method);
        }
    }
}, UserPermissions.MANAGE_INVENTORY);

export default handler;
