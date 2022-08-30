import {NextApiRequest, NextApiResponse} from "next";
import {authenticated} from "../../../utils/api/auth";
import {UserPermissions} from "../../../types/UserPermissions";
import createDBConnection from "../../../database/mongo/db";
import {Config, IConfig} from "../../../database/mongo/schemas/Config";
import Joi from "joi";

const PatchBody = Joi.object({
    stockWarningMinimum: Joi.number()
})

const handler = authenticated(async (req: NextApiRequest, res: NextApiResponse) => {
    const { method, body } = req;

    try {
        switch (method) {
            case "GET": {
                await createDBConnection();
                let config = (await Config.find())[0];

                if (!config)
                    config = await Config.create(generateDefaultConfig());
                return res.status(200).json(config);
            }
            case "PATCH": {
                const { error } = PatchBody.validate(body)
                if (error)
                    return res.status(400).json({ error: error.details[0].message});

                await createDBConnection();
                let config = (await Config.find())[0];

                if (!config)
                    config = await Config.create(generateDefaultConfig());

                if (body.stockWarningMinimum)
                    config.stockWarningMinimum = body.stockWarningMinimum;
                const newDoc = await config.save();
                return res.status(200).json(newDoc);
            }
            default: {
                return res.status(405).json({ error: `You cannot ${method} this route!`});
            }
        }
    } catch (e) {
        // @ts-ignore
        return res.status(500).json({ error: e.message || e });
    }

}, UserPermissions.ADMINISTRATOR);

const generateDefaultConfig = (): IConfig => {
    return {
        stockWarningMinimum: 10
    }
}

export default handler;