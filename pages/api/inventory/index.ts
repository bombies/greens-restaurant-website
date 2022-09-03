import createDBConnection from "../../../database/mongo/db";
import {StockCategory, StockCategoryJoiSchema} from "../../../database/mongo/schemas/StockCategories";
import {authenticated} from "../../../utils/api/auth";
import {UserPermissions} from "../../../types/UserPermissions";
import { handleInvalidHTTPMethod, handleJoiValidation } from "../../../utils/GeneralUtils";

const handler = authenticated(async (req, res) => {
    const { method, body } = req;

    try {
        switch (method) {
            case "GET": {
                const allCategories = await StockCategory.find();
                return res.status(200).json(allCategories);
            }
            case "POST": {
                if (!handleJoiValidation(res, StockCategoryJoiSchema, body))
                    return;

                await createDBConnection();

                let existingDoc = await StockCategory.findOne({ id: body.id });
                if (existingDoc)
                    return res.status(400).json({ error: `There is already a category with ID "${body.id}"` });

                existingDoc = await StockCategory.findOne({ name: body.name });
                if (existingDoc)
                    return res.status(400).json({ error: `There is already a category with name "${body.name}"` });

                let mutableBody = {...body};
                mutableBody.stock ??= [];

                const createdDoc = await StockCategory.create(mutableBody);
                return res.status(200).json(createdDoc);
            }
            default: {
                return handleInvalidHTTPMethod(res, method);
            }
        }
    } catch (e) {
        // @ts-ignore
        return res.status(500).json({ error: e.message || e });
    }
}, UserPermissions.MANAGE_INVENTORY);

export default handler;