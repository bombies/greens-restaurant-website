import { authenticated, respond } from "../../../../utils/api/ApiUtils";
import { Permission } from "../../../../libs/types/permission";
import prisma from "../../../../libs/prisma";
import { v4 } from "uuid";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";
import { Mailer } from "../../../../utils/api/Mailer";

export type InviteDto = {
    firstName: string,
    lastName: string,
    username: string
    email: string
    permissions: number
}

export async function POST(req: Request) {
    return await authenticated(req, async () => {
        const { firstName, lastName, username, email, permissions }: InviteDto = await req.json();

        if (!username || !email || permissions === undefined)
            return respond({ message: "Malformed payload!", init: { status: 401 } });

        const existingUser = await prisma.user.findMany({
            where: {
                OR: [
                    { username: username.toLowerCase() },
                    { email: email }
                ]
            }
        });

        if (existingUser.length !== 0)
            return respond({ message: "There is already a user with that email/username!", init: { status: 401 } });

        const password = v4();
        const mailInfo = await Mailer.sendDashboardInvite(
            email,
            firstName,
            username,
            password
        );

        if (mailInfo.accepted.includes(email)) {
            const hashedPassword = await bcrypt.hash(password, 12);
            const createdUser = await prisma.user.create({
                data: {
                    firstName,
                    lastName,
                    username: username.toLowerCase(),
                    email: email.toLowerCase(),
                    permissions,
                    password: hashedPassword
                }
            });
            return NextResponse.json(createdUser);
        } else return respond({ message: "Could not send invitation email!", init: { status: 401 } });

    }, Permission.ADMINISTRATOR);
}