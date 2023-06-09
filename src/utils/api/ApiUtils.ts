import { NextResponse } from "next/server";
import Permission, { hasPermission } from "../../libs/types/permission";
import { getServerSession, Session } from "next-auth";
import { authHandler } from "../../app/api/auth/[...nextauth]/route";
import nodemailer from "nodemailer";
import Mail from "nodemailer/lib/mailer";

export const authenticated = async (logic: (session: Session) => Promise<NextResponse>, permissionRequired?: Permission): Promise<NextResponse> => {
    const session = await getServerSession(authHandler);
    if (!session || !session.user)
        return respond({ message: "Unauthorized!", init: { status: 403 } });

    if (permissionRequired && !hasPermission(session.user.permissions, permissionRequired))
        return respond({ message: "Unauthorized! No permission.", init: { status: 403 } });

    try {
        return await logic(session);
    } catch (ex: any) {
        console.error(ex);
        return respond({ message: "Internal Server Error", init: { status: 500 } });
    }
};

export const respond = (options: {
    data?: any,
    message?: string,
    init?: ResponseInit
}) => {
    return NextResponse.json(options.data || {
        message: options.message
    }, options.init);
};

export class Mailer {
    private static readonly transporter = nodemailer.createTransport({
        host: process.env.MAILER_HOST,
        port: Number(process.env.MAILER_PORT),
        secure: false,
        requireTLS: true,
        auth: {
            user: process.env.MAILER_USER,
            pass: process.env.MAILER_PASSWORD
        },
    });

    public static async sendMail(options: Mail.Options) {
        return await Mailer.transporter.sendMail(options);
    }
}