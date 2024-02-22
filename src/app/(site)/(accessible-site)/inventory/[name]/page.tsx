import inventoryService from "@/app/api/inventory/[name]/service";
import Inventory from "./_components/Inventory";
import configService from "@/app/api/config/service";
import { notFound, redirect } from "next/navigation";
import Permission, { hasAnyPermission } from "@/libs/types/permission";
import userService from "@/app/api/users/me/service";
import { getServerSession } from "next-auth";
import { authHandler } from "@/app/api/auth/[...nextauth]/utils";

type Context = {
    params: {
        name: string
    }
}

export default async function SpecificInventoryPage({ params }: Context) {
    const session = await getServerSession(authHandler)
    const self = await userService.getSelf(session)

    if (!hasAnyPermission(self?.permissions, [
        Permission.VIEW_INVENTORY,
        Permission.CREATE_INVENTORY,
        Permission.MUTATE_STOCK
    ]))
        redirect("/home")

    const inventorySnapshot = await inventoryService.fetchCurrentSnapshotHeadless(params.name)
    if (!inventorySnapshot)
        notFound()

    const config = await configService.getConfig()
    return <Inventory
        name={params.name}
        config={config}
        snapshot={inventorySnapshot}
        userData={self!}
    />;
}