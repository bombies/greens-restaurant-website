import {NextApiRequest, NextApiResponse} from "next";
import Joi from "joi";
import createDBConnection from "../../../database/mongo/db";
import {StockCategory} from "../../../database/mongo/schemas/StockCategories";
import {authenticated} from "../../../utils/api/auth";
import {UserPermissions} from "../../../types/UserPermissions";
import { handleInvalidHTTPMethod, handleJoiValidation } from "../../../utils/GeneralUtils";

const PatchBody = Joi.object({
    name: Joi.string(),
    index: Joi.number(),
    stock: Joi.array().items(Joi.object({
        uid: Joi.string().required(),
        name: Joi.string().required(),
        quantity: Joi.number().required(),
        lastUpdated: Joi.number().required()
    }))
});

const PutBody = Joi.object({
    uid: Joi.string().required(),
    name: Joi.string().required(),
    quantity: Joi.number().required(),
    lastUpdated: Joi.number().required()
})

const handler = authenticated(async (req: NextApiRequest, res: NextApiResponse) => {
    const { method, body, query } = req;
    const { id } = query;

    try {
        switch (method) {
            case "GET": {
                await createDBConnection();
                const fetchedDoc = await StockCategory.findOne({ id: id });
                if (!fetchedDoc)
                    return res.status(404).json({ error: `There was no category with the ID ${id}` });
                return res.status(200).json(fetchedDoc);
            }
            case "PUT": {
                if (!handleJoiValidation(res, PutBody, body))
                    return;

                await createDBConnection();
                const fetchedDoc = await StockCategory.findOne({ id: id });
                if (!fetchedDoc)
                    return res.status(404).json({ error: `There was no category with the ID ${id}` });

                const existingItem = fetchedDoc.stock.filter(x => x.name.toLowerCase() === body.name.toLowerCase());
                if (existingItem)
                    return res.status(401).json({ error: `There is already an item with the name "${body.name}"`});

                fetchedDoc.stock = [...fetchedDoc.stock, body];
                fetchedDoc.lastUpdated = new Date().getTime();
                const newDoc = await fetchedDoc.save();
                return res.status(200).json(newDoc);
            }
            case "PATCH": {
                if (!handleJoiValidation(res, PatchBody, body))
                    return;

                await createDBConnection();
                const fetchedDoc = await StockCategory.findOne({ id: id });
                if (!fetchedDoc)
                    return res.status(404).json({ error: `There was no category with the ID ${id}` });

                if (body.name)
                    fetchedDoc.name = body.name;
                if (body.index)
                    fetchedDoc.index = body.index;
                if (body.stock)
                    fetchedDoc.stock = body.stock;
                fetchedDoc.lastUpdated = new Date().getTime();
                const newDoc = await fetchedDoc.save();
                return res.status(200).json(newDoc);
            }
            case "DELETE": {
                await createDBConnection();
                const fetchedDoc = await StockCategory.findOne({ id: id });
                if (!fetchedDoc)
                    return res.status(404).json({ error: `There was no category with the ID ${id}` });
                await StockCategory.deleteOne({ id: id });
                return res.status(200).json({ message: `You have deleted the "${fetchedDoc.name}" category!`});
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