import { authenticated, respond } from "../../../../../utils/api/ApiUtils";
import Permission from "../../../../../libs/types/permission";
import { compare } from "bcrypt";
import prisma from "../../../../../libs/prisma";
import { NextResponse } from "next/server";

type PostDto = {
    password: string;
}

export async function POST(req: Request) {
    return authenticated(async (session) => {
        const user = await prisma.user.findUnique({
            where: {
                username: session.user?.username
            }
        });

        if (!user)
            return respond({
                message: "There is no user with your current username found in the database!",
                init: {
                    status: 404
                }
            });

        const body: PostDto = await req.json();
        if (!body.password)
            return respond({
                message: "You must provide a password to compare!"
            });
        return NextResponse.json({
            result: await compare(body.password, user.password)
        });
    }, Permission.ADMINISTRATOR);
}