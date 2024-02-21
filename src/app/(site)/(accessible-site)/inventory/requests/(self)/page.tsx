import Container from "@/app/_components/Container";
import { GoBackButton } from "../../../invoices/[id]/components/control-bar/InvoiceCustomerControlBar";
import { Spacer } from "@nextui-org/react";
import UserInventoryRequestsPage from "../../_components/requests/user/UserInventoryRequestsTab";
import InventoryRequestsHeader from "../components/InventoryRequestsHeader";

export default async function InventoryRequestsPage() {
    return (
        <>
            <InventoryRequestsHeader
                visibleButtons={["all_requests", "reports"]}
            />
            <Container>
                <GoBackButton label="View All Inventories" href="/inventory" />
                <Spacer y={6} />
                <UserInventoryRequestsPage />
            </Container>
        </>
    );
}