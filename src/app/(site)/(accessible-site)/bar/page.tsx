"use client";

import useSWR from "swr";
import { fetcher } from "../employees/_components/EmployeeGrid";
import { Inventory } from "@prisma/client";
import { InventorySnapshotWithInventoryAndStockSnapshots } from "../../../api/inventory/[name]/utils";
import { useUserData } from "../../../../utils/Hooks";
import Permission, { hasAnyPermission } from "../../../../libs/types/permission";
import BarStockTable from "../inventory/[name]/_components/table/BarStockTable";

const useBarInfo = () => {
    return useSWR("/api/inventory/bar", fetcher<Inventory>);
};

const useCurrentBarSnapshot = (name?: string) => {
    return useSWR(`/api/inventory/bar/${name}/currentsnapshot`, fetcher<InventorySnapshotWithInventoryAndStockSnapshots>);
};

export default function BarPage() {
    const { data: userData } = useUserData([Permission.MUTATE_BAR_INVENTORY, Permission.VIEW_BAR_INVENTORY, Permission.CREATE_INVENTORY]);
    const { data: barInfo, isLoading: barInfoLoading } = useBarInfo();
    const { data: currentSnapshot, isLoading: currentSnapshotLoading, mutate: mutateCurrentSnapshot } = useCurrentBarSnapshot(barInfo?.name);

    return (
        <div className="default-container p-12 phone:px-4">
            <BarStockTable
                currentSnapshot={currentSnapshot}
                mutateCurrentSnapshot={mutateCurrentSnapshot}
                stockIsLoading={barInfoLoading || currentSnapshotLoading}
                mutationAllowed={hasAnyPermission(userData?.permissions, [
                    Permission.CREATE_INVENTORY,
                    Permission.MUTATE_BAR_INVENTORY
                ])}
            />
        </div>
    );
}