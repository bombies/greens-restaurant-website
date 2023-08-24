"use client";

import { FC } from "react";
import GenericTabs from "../../../../../_components/GenericTabs";
import { Tab } from "@nextui-org/react";
import UserInventoryRequestsTab from "./user/UserInventoryRequestsTab";
import AllInventoryRequestsTab from "./all/AllInventoryRequestsTab";
import { hasAnyPermission, Permission } from "../../../../../../libs/types/permission";

interface Props {
    userPermissions?: number;
}

const InventoryRequestsContainer: FC<Props> = ({ userPermissions }) => {
    return (
        <div className="default-container p-12 phone:px-4 w-5/6 tablet:w-full">
            <GenericTabs>
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