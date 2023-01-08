import { authenticated } from "../../../utils/api/auth";
import { UserPermission } from "../../../types/UserPermission";
import { handleInvalidHTTPMethod, handleJoiValidation } from "../../../utils/GeneralUtils";
import Joi from "joi";
import createDBConnection from "../../../database/mongo/db";
import { User } from "../../../database/mongo/schemas/Users";

const DeleteBody = Joi.object({
    username: Joi.string().required()
})

const handler = authenticated(async (req, res) => {
    const { method, body } = req;

    switch (method) {
        case "GET": {
            await createDBConnection();
            const users = await User.find();
            return res.status(200).json(users);
        }
        default: {
            return handleInvalidHTTPMethod(res, method);
        }
    }
}, UserPermission.MANAGE_EMPLOYEES);

export default handler;