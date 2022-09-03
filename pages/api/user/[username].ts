import {authenticated} from "../../../utils/api/auth";
import createDBConnection from "../../../database/mongo/db";
import {User} from "../../../database/mongo/schemas/Users";
import {UserPermissions} from "../../../types/UserPermissions";
import { handleInvalidHTTPMethod } from "../../../utils/GeneralUtils";

const handler = authenticated(async (req, res) => {
    const { method, query } = req;
    const { username } = query;
    try {
        switch (method) {
            case "GET": {
                await createDBConnection();

                const person = await User.findOne({ username: username });
                if (!person)
                    return res.status(400).json({ error: `There is no one with the username: ${username}`})
                person.password = undefined;
                return res.status(200).json({ data: person });
            }
            default: {
                return handleInvalidHTTPMethod(res, method);
            }
        }
    } catch (e) {
        // @ts-ignore
        return res.status(500).json({ error: e.message || e });
    }
}, UserPermissions.ADMINISTRATOR);

export default handler;