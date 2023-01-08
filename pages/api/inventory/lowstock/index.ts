import { authenticated } from "../../../../utils/api/auth";
import { UserPermission } from "../../../../types/UserPermission";
import createDBConnection from "../../../../database/mongo/db";
import {
    IStockCategory,
    StockCategory,
} from "../../../../database/mongo/schemas/StockCategories";
import { StockItem } from "../../../../types/InventoryCategoryObject";
import { handleInvalidHTTPMethod } from "../../../../utils/GeneralUtils";
import { getConfig } from "../../management";

const handler = authenticated(async (req, res) => {
    const { method } = req;

    try {
        switch (method) {
            case "GET": {
                await createDBConnection();
                let config = await getConfig();
                const allCategories = await StockCategory.find();

                let result: { id: string, name: string; stock: StockItem[] }[] | [] = [];
                allCategories.forEach((category: IStockCategory) => {
                    let obj = { id: category.id, name: category.name, stock: [] };

                    category.stock.forEach((item: StockItem) => {
                        if (item.quantity < config.inventory.stockWarningMinimum)
                            // @ts-ignore
                            obj.stock.push(item);
                    });

                    if (obj.stock.length !== 0)
                        // @ts-ignore
                        result.push(obj);
                });
                
                return res.status(200).json(result);
            }
            default: {
                return handleInvalidHTTPMethod(res, method);
            }
        }
    } catch (e) {
        // @ts-ignore
        return res.status(500).json({ error: e.message || e });
    }
}, UserPermission.MANAGE_INVENTORY);

export default handler;
