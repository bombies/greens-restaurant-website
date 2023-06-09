import { authenticated, respond } from "../../../../utils/api/ApiUtils";
import Permission from "../../../../libs/types/permission";
import prisma from "../../../../libs/prisma";
import { NextResponse } from "next/server";

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