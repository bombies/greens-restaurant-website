import Container from "@/app/_components/Container";
import { Spacer } from "@nextui-org/react";
import { GoBackButton } from "../../../invoices/[id]/components/control-bar/InvoiceCustomerControlBar";
import AllInventoryRequestsPage from "../../_components/requests/all/AllInventoryRequestsTab";
import Permission, { hasAnyPermission } from "@/libs/types/permission";
import { getServerSession } from "next-auth";
import { authHandler } from "@/app/api/auth/[...nextauth]/utils";
import userService from "@/app/api/users/me/service";
import { redirect } from "next/navigation";
import InventoryRequestsHeader from "../components/InventoryRequestsHeader";

export default async function InventoryRequestsPage() {
    const session = await getServerSession(authHandler)
    const self = await userService.getSelf(session)

    if (!hasAnyPermission(self?.permissions, [
        Permission.CREATE_INVENTORY,
        Permission.VIEW_STOCK_REQUESTS,
        Permission.CREATE_STOCK_REQUEST,
        Permission.MANAGE_STOCK_REQUESTS,
    ]))
        redirect("/home")

    return (
        <>
            <InventoryRequestsHeader
                visibleButtons={["my_requests", "reports"]}
            />
            <Container>
                <GoBackButton label="View All Inventories" href="/inventory" />
                <Spacer y={6} />
                <AllInventoryRequestsPage
                    userPermissions={self?.permissions ?? 0}
                />
            </Container>
        </>
    );
}