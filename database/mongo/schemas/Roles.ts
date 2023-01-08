import mongoose, { Schema } from "mongoose";

export interface IRoles {
    roleID: string;
    roleName: string;
    permissions: number;
}

const RolesSchema = new Schema<IRoles>({
    roleID: { type: String, required: true },
    roleName: { type: String, required: true },
    permissions: { type: Number, required: true },
});

export default RolesSchema;
export const Roles = mongoose.models.roles || mongoose.model("roles", RolesSchema, "roles")