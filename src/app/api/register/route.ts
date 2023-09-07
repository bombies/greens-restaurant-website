import { NextResponse } from "next/server";
import bcrypt from 'bcrypt';
import prisma from "../../../libs/prisma";
import { v4 } from "uuid";
import { respond } from "../../../utils/api/ApiUtils";

type PostDto = {
    firstName: string,
    lastName: string,
    username: string
    password: string
}

export async function POST(req: Request) {
    const { headers} = req
    const body: PostDto = await req.json()
    const auth = headers.get("authorization")

    if (!auth || auth !== process.env.APP_SECRET)
        return respond({
            message: "Invalid authorization!",
            init: {
                status: 403
            }
        })

    if (!body.username || !body.password)
        return respond({
            message: "Malformed body!",
            init: {
                status: 400
            }
        })

    const salt = bcrypt.genSaltSync(12);
    const hashedPassword = await bcrypt.hash(body.password, salt);
    const createdUser = await prisma.user.create({
        data: {
            firstName: body.firstName,
            lastName: body.lastName,
            username: body.username.toLowerCase(),
            password: hashedPassword,
            email: v4(),
            permissions: 1 << 8
        }
    });

    return NextResponse.json(createdUser);
}