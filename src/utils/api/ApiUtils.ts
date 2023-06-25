import { NextResponse } from "next/server";
import Permission, { hasAnyPermission, hasPermissions } from "../../libs/types/permission";
import { getServerSession, Session } from "next-auth";
import { authHandler } from "../../app/api/auth/[...nextauth]/route";
import nodemailer from "nodemailer";
import Mail from "nodemailer/lib/mailer";
import { AuthenticatedServerAxiosClient } from "./AuthenticatedServerAxiosClient";
import { getToken } from "next-auth/jwt";
import prisma from "../../libs/prisma";

export const authenticated = async (
    request: Request,
    logic: (session: Session, axios: AuthenticatedServerAxiosClient) => Promise<NextResponse>,
    permissionRequired?: Permission
): Promise<NextResponse> => {
    return authenticatedAny(request, logic, permissionRequired ? [permissionRequired] : undefined);
};

export const authenticatedAny = async (
    request: Request,
    logic: (session: Session, axios: AuthenticatedServerAxiosClient) => Promise<NextResponse>,
    permissionsRequired?: Permission[]
): Promise<NextResponse> => {
    const session = await getServerSession(authHandler);
    if (!session || !session.user)
        return respond({ message: "Unauthorized!", init: { status: 403 } });

    const userPermissions = await fetchPermissionsFromUserSession(session);
    if (permissionsRequired && !hasAnyPermission(userPermissions, permissionsRequired))
        return respond({ message: "Unauthorized! No permission.", init: { status: 403 } });

    try {
        // @ts-ignore
        const token = await getToken({ req: request, raw: true });
        const client = new AuthenticatedServerAxiosClient(token);
        return await logic(session, client);
    } catch (ex: any) {
        console.error(ex);
        return respond({ message: "Internal Server Error", init: { status: 500 } });
    }
};

export const authenticatedAll = async (
    request: Request,
    logic: (session: Session, axios: AuthenticatedServerAxiosClient) => Promise<NextResponse>,
    permissionsRequired?: Permission[]
): Promise<NextResponse> => {
    const session = await getServerSession(authHandler);
    if (!session || !session.user)
        return respond({ message: "Unauthorized!", init: { status: 403 } });

    const userPermissions = await fetchPermissionsFromUserSession(session);
    if (permissionsRequired && !hasPermissions(userPermissions, permissionsRequired))
        return respond({ message: "Unauthorized! No permission.", init: { status: 403 } });

    try {
        // @ts-ignore
        const token = await getToken({ req: request, raw: true });
        const client = new AuthenticatedServerAxiosClient(token);
        return await logic(session, client);
    } catch (ex: any) {
        console.error(ex);
        return respond({ message: "Internal Server Error", init: { status: 500 } });
    }
};

const fetchPermissionsFromUserSession = async (session: Session): Promise<number> => {
    const user = await prisma.user.findUnique({
        where: {
            username: session.user?.username
        }
    });
    return user?.permissions || 0;
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
        }
    });

    public static async sendMail(options: Mail.Options) {
        return await Mailer.transporter.sendMail(options);
    }
}