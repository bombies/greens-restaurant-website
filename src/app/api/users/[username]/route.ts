import { authenticated, Mailer, respond } from "../../../../utils/api/ApiUtils";
import Permission from "../../../../libs/types/permission";
import prisma from "../../../../libs/prisma";
import { NextResponse } from "next/server";
import { User } from "@prisma/client";
import { EMAIL_REGEX, NAME_REGEX, PASSWORD_REGEX, USERNAME_REGEX } from "../../../../utils/regex";
import bcrypt from "bcrypt";

type RouteContext = {
    params: {
        username: string
    }
}

export async function GET(req: Request, { params }: RouteContext) {
    return await authenticated(async () => {
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
    return await authenticated(async () => {
        const user = await prisma.user.findUnique({
            where: { username: params.username }
        });

        if (!user)
            return respond({
                message: `There was no user with the username: ${params.username}`,
                init: { status: 404 }
            });

        const deletedUser = await prisma.user.delete({
            where: { username: params.username }
        });

        return NextResponse.json(deletedUser);
    }, Permission.ADMINISTRATOR);
}

type UpdateUserDto = Partial<{
    username: string
    firstName: string
    lastName: string
    email: string
    password: string,
    image: string | null
    permissions: number
    createdInventoryIds: string[]
}>

export async function PATCH(req: Request, { params }: RouteContext) {
    return await authenticated(async () => {
        const user = await prisma.user.findUnique({
            where: { username: params.username }
        });

        if (!user)
            return respond({
                message: `There was no user with the username: ${params.username}`,
                init: { status: 404 }
            });

        const body: UpdateUserDto = await req.json();
        if (!body)
            return respond({ message: "You must provide some information to update!" });

        // Validation
        if (body.username) {
            if (!USERNAME_REGEX.test(body.username))
                return respond({
                    message: "Invalid username! Usernames must include alphanumeric characters only.",
                    init: { status: 401 }
                });

            const existingUser = await prisma.user.findUnique({
                where: {
                    username: body.username
                }
            });

            if (existingUser)
                return respond({
                    message: `There is already a user with the username ${body.username}`,
                    init: { status: 401 }
                });
        }

        if (body.password) {
            if (!PASSWORD_REGEX.test(body.password))
                return respond({
                    message: "The password must be between 6 and 256 characters!",
                    init: {
                        status: 401
                    }
                });
            body.password = await bcrypt.hash(body.password, 12);
        }

        if (body.firstName) {
            if (!NAME_REGEX.test(body.firstName))
                return respond({
                    message: "That first name is invalid! Remove any spaces or special characters that may be in the name.",
                    init: {
                        status: 401
                    }
                });
        }

        if (body.lastName) {
            if (!NAME_REGEX.test(body.lastName))
                return respond({
                    message: "That last name is invalid! Remove any spaces or special characters that may be in the name.",
                    init: {
                        status: 401
                    }
                });
        }

        if (body.email) {
            if (!EMAIL_REGEX.test(body.email))
                return respond({
                    message: "Invalid email!",
                    init: { status: 401 }
                });

            const existingUser = await prisma.user.findUnique({
                where: {
                    email: body.email
                }
            });

            if (existingUser)
                return respond({
                    message: `There is already a user with the email: ${body.username}`,
                    init: { status: 401 }
                });

            await Mailer.sendMail({
                from: "\"Green's Pub\" <no-reply@robertify.me>",
                to: body.email,
                subject: "Email Updated",
                html: `
                <div>
                    <h1>Hello ${user.firstName}</h1>
                    <p>Your email for account with username <b>${body.username || user.username}</b> has been updated to this one. (${body.email})</p>
                </div>
            `
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