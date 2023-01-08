import createDBConnection from "../../../../database/mongo/db";
import { Config } from "../../../../database/mongo/schemas/Config";
import {
    StockCategory,
    IStockCategory,
} from "../../../../database/mongo/schemas/StockCategories";
import { StockItem } from "../../../../types/InventoryCategoryObject";
import { UserPermission } from "../../../../types/UserPermission";
import { authenticated } from "../../../../utils/api/auth";
import { handleInvalidHTTPMethod } from "../../../../utils/GeneralUtils";
import { getConfig } from "../../management";

const handler = authenticated(async (req, res) => {
    const { method, query } = req;
    const { id } = query;

    switch (method) {
        case "GET": {
            await createDBConnection();
            let config = await getConfig();
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
                if (item.quantity < config.inventory.stockWarningMinimum)
                    result.stock.push(item);
            });

            return res.status(200).json(result);
        }
        default: {
            return handleInvalidHTTPMethod(res, method);
        }
    }
}, UserPermission.MANAGE_INVENTORY);

export default handler;
