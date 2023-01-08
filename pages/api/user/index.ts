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
        case "DELETE": {
            if (!handleJoiValidation(res, DeleteBody, body))
                return;

            await createDBConnection();
            const user = User.findOne({ username: body.username });
            if (!user)
                return res.status(400).json({ error: `There was no user with the username: ${body.username}`});
            await User.deleteOne({ username: body.username });
            return res.status(200).json({ message: `Successfully deleted ${body.username}`});
        }
        default: {
            return handleInvalidHTTPMethod(res, method);
        }
    }
}, UserPermission.MANAGE_EMPLOYEES);

export default handler;