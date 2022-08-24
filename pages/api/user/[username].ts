import {authenticated} from "../../../utils/api/auth";
import createDBConnection from "../../../database/mongo/db";
import {User} from "../../../database/mongo/schemas/Users";
import {UserPermissions} from "../../../types/UserPermissions";

const handler = authenticated(async (req, res) => {
    const { method, query } = req;
    const { username } = query;
    await createDBConnection();

    switch (method) {
        case "GET": {
            const person = await User.findOne({ username: username });
            if (!person)
                return res.status(400).json({ error: `There is no one with the username: ${username}`})
            person.password = undefined;
            return res.status(200).json({ data: person });
        }
        default: {
            return res.status(405).json({ error: `You cannot ${method} this route!`});
        }
    }
}, UserPermissions.ADMINISTRATOR);

export default handler;