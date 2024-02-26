import { authHandler } from "@/app/api/auth/[...nextauth]/utils";
import userService from "@/app/api/users/me/service";
import Permission, { hasAnyPermission } from "@/libs/types/permission";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import InventoryRequestsHeader from "../components/InventoryRequestsHeader";
import Container from "@/app/_components/Container";
import { GoBackButton } from "../../../invoices/[id]/components/control-bar/InvoiceCustomerControlBar";
import { Spacer } from "@nextui-org/react";
import InventoryRequestsReportsPage from "../../_components/requests/reports/InventoryRequestsReportsTab";

export default async function InventoryRequestsReports() {
    const session = await getServerSession(authHandler)
    const self = await userService.getSelf(session)

    if (!hasAnyPermission(self?.permissions, [
        Permission.CREATE_INVENTORY,
        Permission.CREATE_STOCK_REQUEST,
        Permission.MANAGE_STOCK_REQUESTS,
    ]))
        redirect("/home")

    return (
        <>
            <InventoryRequestsHeader
                visibleButtons={["my_requests", "all_requests"]}
            />
            <Container>
                <GoBackButton label="View All Requests" href="/inventory/requests/all" />
                <Spacer y={6} />
                <InventoryRequestsReportsPage />
            </Container>
        </>
    );
}