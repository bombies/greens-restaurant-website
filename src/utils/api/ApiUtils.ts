import { NextResponse } from "next/server";
import Permission, { hasAnyPermission, hasPermissions } from "../../libs/types/permission";
import { getServerSession, Session } from "next-auth";
import { authHandler } from "../../app/api/auth/[...nextauth]/route";
import { AuthenticatedServerAxiosClient } from "./AuthenticatedServerAxiosClient";
import { getToken } from "next-auth/jwt";
import prisma from "../../libs/prisma";
import { z } from "zod";

export const authenticated = async (
    request: Request,
    logic: (session: Session, axios: AuthenticatedServerAxiosClient, userPermissions: number) => Promise<NextResponse>,
    permissionRequired?: Permission
): Promise<NextResponse> => {
    return authenticatedAny(request, logic, permissionRequired ? [permissionRequired] : undefined);
};

export const authenticatedAny = async (
    request: Request,
    logic: (session: Session, axios: AuthenticatedServerAxiosClient, userPermissions: number) => Promise<NextResponse>,
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
        return await logic(session, client, userPermissions);
    } catch (ex: any) {
        console.error(ex);
        return respond({ message: "Internal Server Error", init: { status: 500 } });
    }
};

export const authenticatedAll = async (
    request: Request,
    logic: (session: Session, axios: AuthenticatedServerAxiosClient, userPermissions: number) => Promise<NextResponse>,
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
        return await logic(session, client, userPermissions);
    } catch (ex: any) {
        console.error(ex);
        return respond({ message: "Internal Server Error", init: { status: 500 } });
    }
};

const fetchPermissionsFromUserSession = async (session: Session): Promise<number> => {
    const user = await prisma.user.findUnique({
        where: {
            username: session.user?.username
        },
        select: {
            permissions: true
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

export const respondWithInit = ({ data, message, validationErrors, ...init }: {
    data?: any,
    message?: string,
    validationErrors?: z.SafeParseReturnType<any, any>
} & ResponseInit) => {
    return NextResponse.json((!validationErrors?.success ? {
        message,
        data: validationErrors?.error.errors
    } : data) || {
        message
    }, init);
};