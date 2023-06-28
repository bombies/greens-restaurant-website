import { authenticated, Mailer, respond } from "../../../../utils/api/ApiUtils";
import { NextResponse } from "next/server";
import prisma from "../../../../libs/prisma";
import { EMAIL_REGEX, PASSWORD_REGEX } from "../../../../utils/regex";
import bcrypt from "bcrypt";

export async function GET(req: Request) {
    return await authenticated(req, async (session) => {
        const user = await prisma.user.findUnique({
            where: { username: session.user?.username }
        });

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
    image: string | null
}>

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
        if (!body)
            return respond({ message: "You must provide some information to update!" });

        // Validation
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

        if (body.email && body.email !== user.email) {
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
                    message: `There is already a user with the email: ${body.email}`,
                    init: { status: 401 }
                });

            await Mailer.sendMail({
                from: "\"Green's Pub\" <no-reply@robertify.me>",
                to: body.email,
                subject: "Email Updated",
                html: `
                <div>
                    <h1>Hello ${user.firstName}</h1>
                    <p>Your email for account with username <b>${user.username}</b> has been updated to this one. (${body.email})</p>
                </div>
            `
            });
        }

        const updatedUser = await prisma.user.update({
            where: {
                username: user.username
            },
            data: {
                email: body.email,
                image: body.image,
                password: body.password
            }
        });

        return NextResponse.json(updatedUser);
    });
}