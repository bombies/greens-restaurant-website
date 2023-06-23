import { authenticated } from "../../../utils/api/ApiUtils";
import Permission from "../../../libs/types/permission";
import prisma from "../../../libs/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    return await authenticated(req, async () => {
        const users = await prisma.user.findMany();
        return NextResponse.json(users.map(user => ({
            ...user,
            password: undefined
        })));
    }, Permission.ADMINISTRATOR)
}