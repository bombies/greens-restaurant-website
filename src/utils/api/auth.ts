import {NextApiHandler, NextApiRequest, NextApiResponse} from "next";
import {UserPermission} from "../../types/UserPermission";

export const authenticated = (fn: NextApiHandler, permissionRequired?: UserPermission) => async (req: NextApiRequest, res: NextApiResponse) => {
    // @ts-ignore
    verify(req.cookies.authorization, process.env.LOCAL_API_KEY, async (err, decoded) => {
        if (!err && decoded) {
            if (permissionRequired) {
                // @ts-ignore
                if (userHasPermission(decoded.permissions, permissionRequired))
                    return await fn(req, res);
                else {
                    return res.status(401).json({
                        error: 'You do not have enough permissions to use this endpoint'
                    });
                }
            }

            return await fn(req, res);
        }

        res.status(401).json({ error: 'You are not authenticated', data: {} });
    });
}

export const userHasPermission = (userPermissions: number, permission: UserPermission) => {
    return ((userPermissions & permission) === permission) || ((userPermissions & UserPermission.ADMINISTRATOR) === UserPermission.ADMINISTRATOR);
}