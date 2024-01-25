"use client";

import { FC } from "react";
import GenericTabs from "../../../../../_components/GenericTabs";
import { Spacer, Tab } from "@nextui-org/react";
import UserInventoryRequestsTab from "./user/UserInventoryRequestsTab";
import AllInventoryRequestsTab from "./all/AllInventoryRequestsTab";
import { hasAnyPermission, Permission } from "../../../../../../libs/types/permission";
import { GoBackButton } from "../../../invoices/[id]/components/control-bar/InvoiceCustomerControlBar";
import useSelectedRequestsTab from "./useSelectedRequestsTab";

interface Props {
    userPermissions?: number;
}

const InventoryRequestsContainer: FC<Props> = ({ userPermissions }) => {
    const {selectedTabKey, updateTabKey} = useSelectedRequestsTab()

    return (
        <div className="default-container p-6 phone:px-4 w-5/6 tablet:w-full">
            {
                hasAnyPermission(userPermissions, [
                    Permission.CREATE_INVENTORY,
                    Permission.VIEW_INVENTORY,
                    Permission.MUTATE_STOCK
                ])
                &&
                <GoBackButton label="View All Inventories" href="/inventory" />
            }
            <Spacer y={6} />
            <GenericTabs
                aria-label={"Inventory Requests"}
                selectedKey={selectedTabKey}
                onSelectionChange={key => updateTabKey(key.toString() as any)}
            >
                <Tab key="my_requests" title="My Requests">
                    <UserInventoryRequestsTab />
                </Tab>
                {
                    hasAnyPermission(userPermissions, [
                        Permission.CREATE_INVENTORY,
                        Permission.MANAGE_STOCK_REQUESTS,
                        Permission.VIEW_STOCK_REQUESTS
                    ])
                    &&
                    <Tab key="all_requests" title="All Requests">
                        <AllInventoryRequestsTab />
                    </Tab>
                }
            </GenericTabs>
        </div>
    );
};

export default InventoryRequestsContainer;