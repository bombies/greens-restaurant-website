import {authenticated} from "../../../utils/api/auth";
import createDBConnection from "../../../database/mongo/db";
import { User, UserJoiPatchSchema, UserJoiSchema } from "../../../database/mongo/schemas/Users";
import {hash} from "bcrypt";
import {UserPermission} from "../../../types/UserPermission";
import { handleInvalidHTTPMethod, handleJoiValidation } from "../../../utils/GeneralUtils";

const handler = authenticated(async (req, res) => {
    const { method, query, body } = req;
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
            case "PATCH": {
                await createDBConnection();

                const person = await User.findOne({ username: username });
                if (!person)
                    return res.status(400).json({ error: `There is no one with the username: ${username}`})

                const { error } = UserJoiPatchSchema.validate(body)
                if (error)
                    throw new Error(error.details[0].message);

                if (body.username)
                    person.username = body.username;
                if (body.password)
                    hash(body.password, 10, async(err, hash) => {
                        person.password = hash;
                    });
                if (body.permissions)
                    person.permissions = body.permissions
                if (body.email)
                    person.email = body.email
                if (body.first_name)
                    person.first_name = body.first_name
                if (body.last_name)
                    person.last_name = body.last_name
                if (body.avatar)
                    person.avatar = body.avatar
                const newPerson = await person.save();
                return res.status(200).json(newPerson)
            }
            case "DELETE": {
                await createDBConnection();
                const user = await User.findOne({ username: username });
                if (!user)
                    return res.status(400).json({ error: `There was no user with the username: ${body.username}`});
                await User.deleteOne({ username: username });
                return res.status(200).json({ message: `Successfully deleted ${body.username}`});
            }
            default: {
                return handleInvalidHTTPMethod(res, method);
            }
        }
    } catch (e) {
        // @ts-ignore
        return res.status(500).json({ error: e.message || e });
    }
}, UserPermission.MANAGE_EMPLOYEES);

export default handler;