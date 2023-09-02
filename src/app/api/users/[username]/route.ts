import { authenticated, respond, respondWithInit } from "../../../../utils/api/ApiUtils";
import Permission, { permissionCheck } from "../../../../libs/types/permission";
import prisma from "../../../../libs/prisma";
import { NextResponse } from "next/server";
import { EMAIL_REGEX, NAME_REGEX, PASSWORD_REGEX, USERNAME_REGEX } from "../../../../utils/regex";
import bcrypt from "bcrypt";
import { User } from "@prisma/client";
import { z } from "zod";
import { Mailer } from "../../../../utils/api/Mailer";

type RouteContext = {
    params: {
        username: string
    }
}

export async function GET(req: Request, { params }: RouteContext) {
    return await authenticated(req, async () => {
        const user = await prisma.user.findUnique({
            where: { username: params.username }
        });

        if (!user)
            return respond({
                message: `There was no user with the username: ${params.username}`,
                init: { status: 404 }
            });

        return NextResponse.json(user);
    }, Permission.ADMINISTRATOR);
}

export async function DELETE(req: Request, { params }: RouteContext) {
    return await authenticated(req, async (session) => {
        const user = await prisma.user.findUnique({
            where: { username: params.username }
        });

        if (!user)
            return respond({
                message: `There was no user with the username: ${params.username}`,
                init: { status: 404 }
            });

        if (user.username === session.user?.username)
            return respond({
                message: "You cannot delete yourself!",
                init: { status: 400 }
            });
        else if (user.username === "root")
            return respond({
                message: "You cannot delete the root user!",
                init: { status: 400 }
            });

        const deletedUser = await prisma.user.delete({
            where: { username: params.username }
        });

        return NextResponse.json(deletedUser);
    }, Permission.ADMINISTRATOR);
}

export type UpdateUserDto = Partial<Omit<User, "id" | "createdInventoryIds" | "createdAt" | "updatedAt" | "image" | "assignedStockRequestsIds">>
const updateUserDtoSchema = z.object({
    username: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    email: z.string(),
    password: z.string(),
    avatar: z.string().nullable(),
    permissions: z.number()
}).partial().strict();

export async function PATCH(req: Request, { params }: RouteContext) {
    return await authenticated(req, async (session) => {
        const user = await prisma.user.findUnique({
            where: { username: params.username }
        });

        if (!user)
            return respond({
                message: `There was no user with the username: ${params.username}`,
                init: { status: 404 }
            });

        if (
            permissionCheck(user.permissions, Permission.ADMINISTRATOR)
            && session.user?.username !== user.username
            && session.user?.username !== "root"
        )
            return respond({
                message: "You cannot edit another administrator that isn't yourself!",
                init: {
                    status: 403
                }
            });

        const body: UpdateUserDto = await req.json();
        const bodyValidated = updateUserDtoSchema.safeParse(body);
        if (!body || !bodyValidated.success)
            return respondWithInit({
                message: "You must provide some information to update!",
                status: 400,
                validationErrors: bodyValidated
            });

        // Validation
        if (body.username && body.username !== user.username) {
            if (!USERNAME_REGEX.test(body.username))
                return respond({
                    message: "Invalid username! Usernames must include alphanumeric characters only.",
                    init: { status: 400 }
                });

            const existingUser = await prisma.user.findUnique({
                where: {
                    username: body.username
                }
            });

            if (existingUser)
                return respond({
                    message: `There is already a user with the username ${body.username}`,
                    init: { status: 400 }
                });
        }

        if (body.password) {
            if (!PASSWORD_REGEX.test(body.password))
                return respond({
                    message: "The password must be between 6 and 256 characters!",
                    init: {
                        status: 400
                    }
                });
            body.password = await bcrypt.hash(body.password, 12);
        }

        if (body.firstName) {
            if (!NAME_REGEX.test(body.firstName))
                return respond({
                    message: "That first name is invalid! Remove any spaces or special characters that may be in the name.",
                    init: {
                        status: 400
                    }
                });
        }

        if (body.lastName) {
            if (!NAME_REGEX.test(body.lastName))
                return respond({
                    message: "That last name is invalid! Remove any spaces or special characters that may be in the name.",
                    init: {
                        status: 400
                    }
                });
        }

        if (body.permissions) {
            if (
                permissionCheck(body.permissions, Permission.ADMINISTRATOR)
                && session.user?.username !== "root"
            )
                return respond({
                    message: "You can't give another user administrator privileges unless you are the root user!",
                    init: {
                        status: 403
                    }
                });
            else if (
                body.password
                && !permissionCheck(body.permissions, Permission.ADMINISTRATOR)
                && body.username === session.user?.username
            )
                return respond({
                    message: "You cannot remove administrator privileges from yourself!",
                    init: {
                        status: 403
                    }
                });
        }

        if (body.email && body.email !== user.email) {
            if (!EMAIL_REGEX.test(body.email))
                return respond({
                    message: "Invalid email!",
                    init: { status: 400 }
                });

            const existingUser = await prisma.user.findUnique({
                where: {
                    email: body.email
                }
            });

            if (existingUser)
                return respond({
                    message: `There is already a user with the email: ${body.email}`,
                    init: { status: 400 }
                });

            await Mailer.sendEmailUpdate({
                to: body.email,
                username: body.username || user.username,
                firstName: user.firstName,
                email: body.email
            });
        }

        const updatedUser = await prisma.user.update({
            where: {
                username: user.username
            },
            data: body
        });

        return NextResponse.json(updatedUser);
    }, Permission.ADMINISTRATOR);
}