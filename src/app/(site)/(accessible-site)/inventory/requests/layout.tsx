import { authHandler } from "@/app/api/auth/[...nextauth]/utils"
import userService from "@/app/api/users/me/service"
import Permission, { hasAnyPermission } from "@/libs/types/permission"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { FC, PropsWithChildren } from "react"

const InventoryRequestsLayout: FC<PropsWithChildren> = async ({ children }) => {
    const session = await getServerSession(authHandler)
    const self = await userService.getSelf(session)

    if (!hasAnyPermission(self?.permissions, [
        Permission.CREATE_INVENTORY,
        Permission.VIEW_STOCK_REQUESTS,
        Permission.CREATE_STOCK_REQUEST,
        Permission.MANAGE_STOCK_REQUESTS
    ]))
        redirect("/home")

    return (
        <>
            {children}
        </>
    )
}

export default InventoryRequestsLayout