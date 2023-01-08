import { NextApiRequest, NextApiResponse } from "next";
import { authenticated } from "../../../utils/api/auth";
import { UserPermission } from "../../../types/UserPermission";
import createDBConnection from "../../../database/mongo/db";
import { Config } from "../../../database/mongo/schemas/Config";
import Joi from "joi";
import {
    handleInvalidHTTPMethod,
    handleJoiValidation,
} from "../../../utils/GeneralUtils";
import { generateDefaultConfig } from "../../../utils/api/ApiUtils";

const PatchBody = Joi.object({
    inventory: Joi.object({
        stockWarningMinimum: Joi.number(),
    }),
    employees: Joi.object({
        jobPositions: Joi.array().items(Joi.string()),
    }),
});

const handler = authenticated(
    async (req: NextApiRequest, res: NextApiResponse) => {
        const { method, body } = req;

        try {
            switch (method) {
                case "GET": {
                    await createDBConnection();
                    const config = await getConfig()
                    // @ts-ignore
                    const { _id: undefined, __v: _, ...result } = config._doc;
                    return res.status(200).json(result);
                }
                case "PATCH": {
                    if (!handleJoiValidation(res, PatchBody, body)) return;

                    await createDBConnection();
                    const config = await getConfig();

                    if (body.inventory) {
                        // @ts-ignore
                        config.inventory.stockWarningMinimum = body.inventory.stockWarningMinimum ?? config.inventory.stockWarningMinimum;
                        config.markModified('inventory');
                    }

                    if (body.employees) {
                        // @ts-ignore
                        config.employees.jobPositions = body.employees.jobPositions ?? config.employees.jobPositions;
                        config.markModified('employees');
                    }


                    // @ts-ignore
                    const newDoc = await config.save();
                    console.log(config, newDoc);
                    // @ts-ignore
                    const { _id: undefined, __v: _, ...result } = newDoc._doc;
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
    },
    UserPermission.ADMINISTRATOR
);

export const getConfig = async () => {
    let config = (await Config.find())[0];
    config ??= await Config.create(generateDefaultConfig());

    config.inventory ??= { stockWarningMinimum: 10 };
    config.inventory.stockWarningMinimum ??= 10;

    config.employees ??= { jobPositions: [] };
    config.employees.jobPositions ??= [];
    return await config.save();
}

export default handler;