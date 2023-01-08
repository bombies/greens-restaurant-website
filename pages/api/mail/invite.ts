import { authenticated } from "../../../utils/api/auth";
import { handleInvalidHTTPMethod, handleJoiValidation } from "../../../utils/GeneralUtils";
import Joi from "joi";
import createDBConnection from "../../../database/mongo/db";
import { sendInvitationEmail } from "../../../utils/mailer/Mailer";

const PostBody = Joi.object({
    email: Joi.string().required(),
    username: Joi.string().required(),
    password: Joi.string().required(),
    first_name: Joi.string().required(),
    last_name: Joi.string().required()
})

const handler = authenticated(async (req, res) => {
    const { method, body } = req;

    try {
        switch (method) {
            case "POST": {
                if (!handleJoiValidation(res, PostBody, body)) return;

                await sendInvitationEmail({
                    username: body.username,
                    email: body.email,
                    first_name: body.first_name,
                    last_name: body.last_name,
                    password: body.password,
                });

                return res.status(200).json({ success: true, message: 'Successfully sent invitation.'});
            }
            default: {
                return handleInvalidHTTPMethod(res, method);
            }
        }
    } catch (e) {
        // @ts-ignore
        return res.status(500).json({ error: e.message || e });
    }

});

export default handler;