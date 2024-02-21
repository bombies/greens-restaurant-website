import { authenticated, respond, respondWithInit } from "../../../../utils/api/ApiUtils";
import { NextResponse } from "next/server";
import prisma from "../../../../libs/prisma";
import { EMAIL_REGEX, PASSWORD_REGEX } from "../../../../utils/regex";
import bcrypt from "bcrypt";
import { z } from "zod";
import { Mailer } from "../../../../utils/api/mail/Mailer";
import userService from "./service";

export async function GET(req: Request) {
    return await authenticated(req, async (session) => {
        const user = await userService.getSelf(session);

        if (!user)
            return respond({
                message: `There was no user with the username: ${session.user?.username}`,
                init: { status: 404 }
            });
            
        const { password, ...rest } = user;
        return NextResponse.json(rest);
    });
}

type UpdateUserDto = Partial<{
    email: string
    password: string,
    avatar: string | null
}>
const updateUserDtoSchema = z.object({
    email: z.string(),
    password: z.string(),
    avatar: z.string()
}).partial();

export async function PATCH(req: Request) {
    return await authenticated(req, async (session) => {
        const user = await prisma.user.findUnique({
            where: { username: session.user?.username }
        });

        if (!user)
            return respond({
                message: `There was no user with the username: ${session.user?.username}`,
                init: { status: 404 }
            });


        const body: UpdateUserDto = await req.json();
        const bodyValidated = updateUserDtoSchema.safeParse(body);
        if (!body)
            return respondWithInit({
                message: "You must provide some information to update!",
                status: 400,
                validationErrors: bodyValidated
            });

        // Validation
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
                username: user.username,
                firstName: user.firstName,
                email: body.email
            });
        }

        const updatedUser = await prisma.user.update({
            where: {
                username: user.username
            },
            data: {
                email: body.email,
                avatar: body.avatar,
                password: body.password
            }
        });

        return NextResponse.json(updatedUser);
    });
}