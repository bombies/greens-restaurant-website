import {authenticated} from "../../utils/api/auth";
import cookie from "cookie";
import {NextApiRequest, NextApiResponse} from "next";

const handler = authenticated((req: NextApiRequest, res: NextApiResponse) => {
    const { method } = req;

    switch (method) {
        case "POST": {
            res.setHeader('Set-Cookie', cookie.serialize('authorization', 'DELETED', {
                httpOnly: true,
                secure: false,
                sameSite: 'strict',
                maxAge: 60 * 60,
                path: '/'
            }));
            return res.status(200).json({ message: 'Logged out'});
        }
        default: {
            return res.status(405).json({ error: `You cannot ${method} this route!`});
        }
    }
});

export default handler;