import { authenticated } from "../../../utils/api/auth";
import { UserPermission } from "../../../types/UserPermission";
import { handleInvalidHTTPMethod, handleJoiValidation } from "../../../utils/GeneralUtils";
import { Roles } from "../../../database/mongo/schemas/Roles";
import { v4 } from "uuid";
import Joi from "joi";
import createDBConnection from "../../../database/mongo/db";

const PostBody = Joi.object({
    roleName: Joi.string().required(),
    permissions: Joi.number().required()
});

const handler = authenticated(async (req, res) => {
    const { method, body } = req;

    try {
        switch (method) {
            case "GET": {
                await createDBConnection();

                const roles = await Roles.find();
                return res.status(200).json(roles);
            }
            case "POST": {
                await createDBConnection();

                if (!handleJoiValidation(res, PostBody, body)) return;
                const createdRole = await Roles.create({ roleID: v4(), ...body})
                return res.status(200).json(createdRole);
            }
            default: {
                return handleInvalidHTTPMethod(res, method)
            }
        }
    } catch (e) {
        // @ts-ignore
        return res.status(500).json({ error: e.message || e });
    }


}, UserPermission.ADMINISTRATOR);

export default handler;