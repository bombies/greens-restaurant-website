"use client";

import { useUserData } from "../../../../../utils/Hooks";
import Permission, { hasAnyPermission } from "../../../../../libs/types/permission";
import Title from "../../../../_components/text/Title";
import SubTitle from "../../../../_components/text/SubTitle";
import { Spacer, Tab } from "@nextui-org/react";
import { Fragment } from "react";
import InventoryIcon from "../../../../_components/icons/InventoryIcon";
import InventoryGrid from "../_components/InventoryGrid";
import RequestIcon from "../../../../_components/icons/RequestIcon";
import InventoryRequestsContainer from "../_components/requests/InventoryRequestsContainer";
import GenericTabs from "../../../../_components/GenericTabs";
import useSelectedInventoryTab from "../_components/hooks/useSelectedInventoryTab";
import { GoBackButton } from "../../invoices/[id]/components/control-bar/InvoiceCustomerControlBar";

export default function InventoryRequestsPage() {
    const { data: userData, isLoading: userDataIsLoading } = useUserData([
        Permission.CREATE_INVENTORY,
        Permission.VIEW_STOCK_REQUESTS,
        Permission.CREATE_STOCK_REQUEST,
        Permission.MANAGE_STOCK_REQUESTS
    ]);
    const { selectedTabKey, setSelectedTabKey } = useSelectedInventoryTab(userDataIsLoading, userData);


    return (
        <div>
            <Title>Inventory Requests</Title>
            <SubTitle>Create and manage inventory requests</SubTitle>
            <Spacer y={12} />
            <GoBackButton label="View All Inventories" href="/inventory" />
            <Spacer y={6} />
            {
                !userDataIsLoading &&
                <Fragment>
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
                        <InventoryRequestsContainer />
                    }
                </Fragment>
            }
        </div>
    );
}