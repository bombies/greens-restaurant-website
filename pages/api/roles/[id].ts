import { authenticated } from "../../../utils/api/auth";
import { UserPermission } from "../../../types/UserPermission";
import { handleInvalidHTTPMethod, handleJoiValidation } from "../../../utils/GeneralUtils";
import { Roles } from "../../../database/mongo/schemas/Roles";
import Joi from "joi";
import createDBConnection from "../../../database/mongo/db";

const PatchBody = Joi.object({
    roleName: Joi.string(),
    permissions: Joi.number()
});

const handler = authenticated(async (req, res) => {
    const { method, body, query } = req;
    const { id } = query;

    try {
        switch (method) {
            case 'GET': {
                await createDBConnection();

                const role = await Roles.findOne({ roleID: id });
                if (!role)
                    return res.status(404).json({ error: `There was no role with the ID: ${id}`})
                return res.status(200).json(role);
            }
            case 'PATCH': {
                await createDBConnection();

                if (!handleJoiValidation(res, PatchBody, body)) return;
                const role = await Roles.findOne({ roleID: id });
                if (!role)
                    return res.status(404).json({ error: `There was no role with the ID: ${id}`})

                if (body.roleName)
                    role.roleName = body.roleName;
                if (body.permissions)
                    role.permissions = body.permissions;
                const savedRole = await role.save()
                return res.status(200).json(savedRole);
            }
            case 'DELETE': {
                await createDBConnection();
                const role = await Roles.findOne({ roleID: id });
                if (!role)
                    return res.status(404).json({ error: `There was no role with the ID: ${id}`})
                await Roles.deleteOne({ roleID: id })
                return res.status(200).json({ message: `Successfully deleted role with ID: ${id}`});
            }
            default: {
                return handleInvalidHTTPMethod(res, method);
            }
        }
    } catch (e) {
        // @ts-ignore
        return res.status(500).json({ error: e.message || e });
    }
}, UserPermission.ADMINISTRATOR);

export default handler;