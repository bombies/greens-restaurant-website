"use client";

import { FC, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserData } from "../../../../../../../utils/Hooks";
import { hasAnyPermission, Permission } from "../../../../../../../libs/types/permission";
import SubTitle from "../../../../../../_components/text/SubTitle";
import { Spacer } from "@nextui-org/react";
import InventoryRequestsReportProvider from "./InventoryRequestsReportProvider";
import InventoryRequestsReportDatePicker from "./InventoryRequestsReportDatePicker";
import InventoryRequestsReportTable from "./InventoryRequestsReportTable";

const InventoryRequestsReportsTab: FC = () => {
    const router = useRouter();
    const { data: userData, isLoading: userDataLoading } = useUserData();
    const canView = !userDataLoading && hasAnyPermission(userData?.permissions, [
        Permission.MANAGE_STOCK_REQUESTS, Permission.VIEW_STOCK_REQUESTS
    ]);

    useEffect(() => {
        if (!userDataLoading && !canView)
            router.replace("/inventory/requests?requests_tab=my_requests");
    }, [canView, router, userDataLoading]);

    return canView && (
        <InventoryRequestsReportProvider>
            <Spacer y={6} />
            <SubTitle>Inventory Requests Reports</SubTitle>
            <Spacer y={6} />
            <InventoryRequestsReportDatePicker />
            <Spacer y={6} />
            <div className="default-container p-6">
                <InventoryRequestsReportTable />
            </div>
        </InventoryRequestsReportProvider>
    );
};

export default InventoryRequestsReportsTab;