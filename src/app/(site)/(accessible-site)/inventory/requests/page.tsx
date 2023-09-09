"use client";

import { useUserData } from "../../../../../utils/Hooks";
import Permission, { hasAnyPermission } from "../../../../../libs/types/permission";
import Title from "../../../../_components/text/Title";
import SubTitle from "../../../../_components/text/SubTitle";
import { Spacer } from "@nextui-org/react";
import { Fragment } from "react";
import InventoryRequestsContainer from "../_components/requests/InventoryRequestsContainer";
import { GoBackButton } from "../../invoices/[id]/components/control-bar/InvoiceCustomerControlBar";

export default function InventoryRequestsPage() {
    const { data: userData, isLoading: userDataIsLoading } = useUserData([
        Permission.CREATE_INVENTORY,
        Permission.VIEW_STOCK_REQUESTS,
        Permission.CREATE_STOCK_REQUEST,
        Permission.MANAGE_STOCK_REQUESTS
    ]);

    return (
        <div>
            <Title>Inventory Requests</Title>
            <SubTitle>Create and manage inventory requests</SubTitle>
            <Spacer y={12} />
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
                        <InventoryRequestsContainer userPermissions={userData?.permissions} />
                    }
                </Fragment>
            }
        </div>
    );
}