import mongoose, { Schema } from "mongoose";
import Joi from "joi";

export interface IUser {
    username: string,
    password?: string,
    first_name: string,
    last_name: string,
    email?: string,
    avatar?: string | null,
    creation_date: number,
    permissions: number
}

export const UserJoiSchema = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required(),
    first_name: Joi.string().required(),
    last_name: Joi.string().required(),
    email: Joi.string().email(),
    avatar: Joi.string().allow(null),
    creation_date: Joi.number().required()
});

export const UserJoiPatchSchema = Joi.object({
    username: Joi.string(),
    password: Joi.string(),
    first_name: Joi.string(),
    last_name: Joi.string(),
    email: Joi.string(),
    avatar: Joi.string().allow(null),
    permissions: Joi.number()
});

const UserSchema = new Schema<IUser>({
    username: { type: String, required: true },
    password: { type: String, required: true},
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    avatar: String,
    email: String,
    creation_date: { type: Number, required: true },
    permissions: { type: Number, required: true }
})

export default UserSchema;
export const User = mongoose.models.user ||  mongoose.model('user', UserSchema)