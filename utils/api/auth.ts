import {NextApiHandler, NextApiRequest, NextApiResponse} from "next";
import {verify} from "jsonwebtoken";

export const authenticated = (fn: NextApiHandler, permissionRequired?: number) => async (req: NextApiRequest, res: NextApiResponse) => {
    // @ts-ignore
    verify(req.cookies.authorization, process.env.LOCAL_API_KEY, async (err, decoded) => {
        if (!err && decoded) {
            if (permissionRequired) {
                // @ts-ignore
                if ((decoded.permissions & permissionRequired) === permissionRequired)
                    return await fn(req, res);
                else return res.status(401).json({
                    error: 'You do not have enough permissions to use this endpoint'
                });
            }

            return await fn(req, res);
        }

        res.status(401).json({ error: 'You are not authenticated', data: {} });
    });
}