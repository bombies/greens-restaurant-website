import {NextApiRequest, NextApiResponse} from "next";
import createDBConnection from "../../database/mongo/db";
import {hash} from "bcrypt";
import {User, UserJoiSchema} from "../../database/mongo/schemas/Users";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const { method, body } = req;
    await createDBConnection();

    switch (method) {
        case 'POST': {
            try {
                const { error } = UserJoiSchema.validate(body)
                if (error)
                    throw new Error(error.details[0].message);

                hash(body.password, 10, async (err, hash) => {
                    const registeredUser = await User.create({...body, password: hash});
                    return res.status(200).json(registeredUser);
                });
            } catch (e) {
                // @ts-ignore
                return res.status(400).json({ error: e.message || e })
            }
            break;
        }
        default: {
            return res.status(405).json({ error: `You cannot ${method} this route!`});
        }
    }
}

export default handler;