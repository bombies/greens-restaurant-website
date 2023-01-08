import { NextApiRequest, NextApiResponse } from "next";
import createDBConnection from "../../database/mongo/db";
import { hash } from "bcrypt";
import { User, UserJoiSchema } from "../../database/mongo/schemas/Users";
import { handleInvalidHTTPMethod } from "../../utils/GeneralUtils";
import { authenticated } from "../../utils/api/auth";
import { UserPermission } from "../../types/UserPermission";

const handler = authenticated(async (req: NextApiRequest, res: NextApiResponse) => {
    const { method, body } = req;

    switch (method) {
        case 'POST': {
            await createDBConnection();

            try {
                const { error } = UserJoiSchema.validate(body)
                if (error)
                    throw new Error(error.details[0].message);

                const existingUser = await User.findOne({
                    $or: [
                        { username: body.username },
                        { email: body.email }
                    ]
                });

                if (existingUser)
                    return res.status(401).json({ error: 'There is already a user with that username or email address.'});

                hash(body.password, 10, async (err, hash) => {
                    const registeredUser = await User.create({ ...body, password: hash, permissions: 0 });
                    return res.status(200).json(registeredUser);
                })
            } catch (e) {
                // @ts-ignore
                return res.status(400).json({ error: e.message || e })
            }
            break;
        }
        default: {
            return handleInvalidHTTPMethod(res, method);
        }
    }
}, UserPermission.ADMINISTRATOR);

export default handler;