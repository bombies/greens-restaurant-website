import {NextApiRequest, NextApiResponse} from "next";
import createDBConnection from "../../database/mongo/db";
import {compare} from "bcrypt";
import Joi from "joi";
import {sign} from "jsonwebtoken";
import cookie from "cookie";
import {User} from "../../database/mongo/schemas/Users";

const LoginSchema = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required()
})

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const { method, body } = req;

    switch (method) {
        case "POST": {
            try {
                const { error } = LoginSchema.validate(body)
                if (error)
                    return res.status(400).json({ error: error.details[0].message});

                await createDBConnection();

                const user = await User.findOne({ username: body.username })
                if (!user)
                    return res.status(400).json({ error: 'Invalid username/password'});

                compare(body.password, user.password, (err, result) => {
                    if (err)
                        return res.status(400).json({ error: err });

                    if (result) {
                        const claims = {
                            sub: user.username,
                            username: user.username,
                            email: user.email,
                            first_name: user.first_name,
                            last_name: user.last_name,
                            avatar: user.avatar,
                            creation_date: user.creation_date,
                            permissions: user.permissions
                        };
                        // @ts-ignore
                        const jwt = sign(claims, process.env.LOCAL_API_KEY, { expiresIn: '1w' });

                        res.setHeader('Set-Cookie', cookie.serialize('authorization', jwt, {
                            httpOnly: true,
                            secure: false,
                            sameSite: 'strict',
                            maxAge: 60 * 60 * 24 * 7,
                            path: '/'
                        }));

                        return res.status(200).json({ message: 'Successfully logged in!', data: {
                                username: user.username,
                                email: user.email,
                                first_name: user.first_name,
                                last_name: user.last_name,
                                avatar: user.avatar,
                                creation_date: user.creation_date,
                                permissions: user.permissions
                            }});
                    } else {
                        return res.status(401).json({ message: 'Invalid username/password'})
                    }
                });
            } catch (e) {
                // @ts-ignore
                return res.status(500).json({ error: e.message || e });
            }
            break;
        }
        default: {
            return res.status(405).json({ error: `You cannot ${method} this route!`});
        }
    }
}

export default handler;