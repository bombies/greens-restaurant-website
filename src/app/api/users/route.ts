import { authenticated } from "../../../utils/api/ApiUtils";
import Permission, { hasAnyPermission } from "../../../libs/types/permission";
import prisma from "../../../libs/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    return await authenticated(req, async () => {
        const { searchParams } = new URL(req.url);
        const withPerms = searchParams.get("with_perms");
        const permissionsParsed: number[] | undefined = withPerms
            ?.replaceAll(/\s/g, "")
            .split(",")
            .map(perm => Number(perm));

        let users = (await prisma.user.findMany())
            .map(user => ({
                ...user,
                password: undefined
            }));

        if (permissionsParsed)
            users = users.filter(user => hasAnyPermission(user.permissions, permissionsParsed));
        return NextResponse.json(users);
    }, Permission.ADMINISTRATOR);
}