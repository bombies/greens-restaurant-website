import prisma from "../../../../libs/prisma";
import { respondWithInit } from "../../../../utils/api/ApiUtils";
import { NextResponse } from "next/server";

type Context = {
    params: {
        number: string
    }
}

export async function GET(req: Request, { params }: Context) {
    const { number } = params;
    if (isNaN(parseInt(number)))
        return respondWithInit({
            message: "The number param wasn't a valid integer!",
            status: 401
        });

    const invoice = await prisma.invoice.findUnique({
        where: {
            number: Number(number)
        },
        include: {
            customer: true
        }
    });

    if (!invoice)
        return respondWithInit({
            message: `There was no invoice with number: ${number}`,
            status: 401
        });

    return NextResponse.json(invoice);
}