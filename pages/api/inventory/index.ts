import {NextApiRequest, NextApiResponse} from "next";
import createDBConnection from "../../../database/mongo/db";
import {StockCategory, StockCategoryJoiSchema} from "../../../database/mongo/schemas/StockCategories";
import {authenticated} from "../../../utils/api/auth";
import {UserPermissions} from "../../../types/UserPermissions";

const handler = authenticated(async (req: NextApiRequest, res: NextApiResponse) => {
    const { method, body } = req;

    try {
        switch (method) {
            case "GET": {
                const allCategories = await StockCategory.find();
                return res.status(200).json(allCategories);
            }
            case "POST": {
                const { error } = StockCategoryJoiSchema.validate(body);
                if (error)
                    return res.status(400).json({ error: error.details[0].message});

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
                return res.status(405).json({ error: `You cannot ${method} this route!`});
            }
        }
    } catch (e) {
        // @ts-ignore
        return res.status(500).json({ error: e.message || e });
    }
}, UserPermissions.MANAGE_INVENTORY);

export default handler;