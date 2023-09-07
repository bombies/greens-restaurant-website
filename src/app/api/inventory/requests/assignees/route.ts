import { authenticatedAny } from "../../../../../utils/api/ApiUtils";
import prisma from "../../../../../libs/prisma";
import Permission, { hasAnyPermission } from "../../../../../libs/types/permission";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    return await authenticatedAny(req, async () => {
        let users = await prisma.user.findMany({
            select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
                image: true,
                avatar: true,
                permissions: true
            }
        });

        users = users.filter(user => hasAnyPermission(user.permissions, [Permission.CREATE_INVENTORY, Permission.MANAGE_STOCK_REQUESTS]));
        return NextResponse.json(users);
    }, [
        Permission.CREATE_INVENTORY,
        Permission.CREATE_STOCK_REQUEST,
        Permission.VIEW_STOCK_REQUESTS,
        Permission.MANAGE_STOCK_REQUESTS
    ]);
}