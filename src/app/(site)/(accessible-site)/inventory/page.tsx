"use client";

import Title from "../../../_components/text/Title";
import SubTitle from "../../../_components/text/SubTitle";
import { hasAnyPermission, Permission } from "../../../../libs/types/permission";
import { Spacer } from "@nextui-org/react";
import InventoryControlBar from "./_components/InventoryControlBar";
import InventoryGrid from "./_components/InventoryGrid";
import { useUserData } from "../../../../utils/Hooks";

export default function InventoryPage() {
    const { isLoading: userDataIsLoading, data: userData } = useUserData([
        Permission.VIEW_INVENTORY,
        Permission.CREATE_INVENTORY,
        Permission.MUTATE_STOCK,
    ]);

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
            <InventoryGrid />
        </div>
    );
}