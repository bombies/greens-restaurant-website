import { getServerSession } from "next-auth";
import SpecificRequestContainer from "./components/SpecificRequestContainer";
import userService from "@/app/api/users/me/service";
import { authHandler } from "@/app/api/auth/[...nextauth]/utils";
import Permission, { hasAnyPermission } from "@/libs/types/permission";
import { redirect } from "next/navigation";

type Context = {
    params: {
        id: string
    }
}

export default async function SpecificRequestPage({ params }: Context) {
    const session = await getServerSession(authHandler)
    const self = await userService.getSelf(session)

    if (!hasAnyPermission(self?.permissions, [
        Permission.CREATE_INVENTORY,
        Permission.CREATE_STOCK_REQUEST,
        Permission.VIEW_STOCK_REQUESTS,
        Permission.MANAGE_STOCK_REQUESTS
    ]))
        redirect("/inventory/requests")

    return (
        <SpecificRequestContainer
            id={params.id}
            isAdmin={hasAnyPermission(self?.permissions, [Permission.CREATE_INVENTORY, Permission.MANAGE_STOCK_REQUESTS])}
        />
    );
}