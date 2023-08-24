"use client";

import Title from "../../../_components/text/Title";
import SubTitle from "../../../_components/text/SubTitle";
import { hasAnyPermission, Permission } from "../../../../libs/types/permission";
import { Spacer, Tab } from "@nextui-org/react";
import InventoryControlBar from "./_components/InventoryControlBar";
import InventoryGrid from "./_components/InventoryGrid";
import { useUserData } from "../../../../utils/Hooks";
import useSelectedInventoryTab from "./_components/hooks/useSelectedInventoryTab";
import GenericTabs from "../../../_components/GenericTabs";
import InventoryRequestsContainer from "./_components/requests/InventoryRequestsContainer";
import InventoryIcon from "../../../_components/icons/InventoryIcon";
import RequestIcon from "../../../_components/icons/RequestIcon";

export default function InventoryPage() {
    const { isLoading: userDataIsLoading, data: userData } = useUserData([
        Permission.VIEW_INVENTORY,
        Permission.CREATE_INVENTORY,
        Permission.MUTATE_STOCK,
        Permission.VIEW_STOCK_REQUESTS,
        Permission.CREATE_STOCK_REQUEST,
        Permission.MANAGE_STOCK_REQUESTS
    ]);
    const { selectedTabKey, setSelectedTabKey } = useSelectedInventoryTab(userDataIsLoading, userData);

    return (
        <div>
            <Title>Inventory</Title>
            <SubTitle>Create, delete and edit inventories</SubTitle>
            <Spacer y={6} />
            {
                hasAnyPermission(
                    userData?.permissions,
                    [Permission.CREATE_INVENTORY]
                ) &&
                <InventoryControlBar
                    controlsEnabled={
                        hasAnyPermission(
                            userData?.permissions,
                            [Permission.CREATE_INVENTORY]
                        )}
                />
            }
            <Spacer y={6} />
            {
                hasAnyPermission(
                    userData?.permissions,
                    [
                        Permission.VIEW_INVENTORY,
                        Permission.CREATE_INVENTORY,
                        Permission.MUTATE_STOCK,
                        Permission.VIEW_STOCK_REQUESTS,
                        Permission.CREATE_STOCK_REQUEST,
                        Permission.MANAGE_STOCK_REQUESTS
                    ]
                ) &&
                <GenericTabs
                    isDisabled={userDataIsLoading}
                    aria-label="Inventory Options"
                    selectedKey={selectedTabKey}
                    onSelectionChange={key => setSelectedTabKey(key.toString())}
                >
                    {
                        hasAnyPermission(
                            userData?.permissions,
                            [
                                Permission.VIEW_INVENTORY,
                                Permission.CREATE_INVENTORY,
                                Permission.MUTATE_STOCK
                            ]
                        ) &&
                        <Tab key="inventories" title={
                            <div className="flex items-center gap-4">
                                <InventoryIcon width={16} fill="currentColor" />
                                <span>Inventories</span>
                            </div>
                        }>
                            <InventoryGrid />
                        </Tab>
                    }
                    {
                        hasAnyPermission(
                            userData?.permissions,
                            [
                                Permission.CREATE_INVENTORY,
                                Permission.VIEW_STOCK_REQUESTS,
                                Permission.CREATE_STOCK_REQUEST,
                                Permission.MANAGE_STOCK_REQUESTS
                            ]
                        ) &&
                        <Tab key="requests" title={
                            <div className="flex items-center gap-4">
                                <RequestIcon fill="currentColor" />
                                <span>Requests</span>
                            </div>
                        }>
                            <InventoryRequestsContainer />
                        </Tab>
                    }
                </GenericTabs>
            }
        </div>
    );
}