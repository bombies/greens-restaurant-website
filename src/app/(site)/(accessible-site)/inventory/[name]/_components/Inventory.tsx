"use client";

import { Config, Inventory, InventorySnapshot, Stock, User } from "@prisma/client";
import useSWR from "swr";
import { fetcher } from "../../../employees/_components/EmployeeGrid";
import { hasAnyPermission, Permission } from "../../../../../../libs/types/permission";
import InventoryStockTable from "./table/InventoryStockTable";
import { InventorySnapshotWithExtras } from "../../../../../api/inventory/[name]/types";
import { DeepRequired } from "react-hook-form";
import useOptimistic from "@/app/hooks/useOptimistic";

type Props = {
    name: string,
    config: DeepRequired<Config>,
    snapshot: InventorySnapshotWithExtras,
    userData: User
}

const useInventoryInfo = (name: string) => {
    return useSWR(`/api/inventory/${name}`, fetcher<Inventory & {
        snapshots: InventorySnapshot[],
        stock: Stock[]
    }>);
};

const useCurrentSnapshot = (name: string) => {
    return useSWR(`/api/inventory/${name}/currentsnapshot`, fetcher<InventorySnapshotWithExtras>);
};

export default function Inventory({ name, config, snapshot, userData }: Props) {
    // const { isLoading: userDataIsLoading, data: userData } = useUserData();
    // const { isLoading: inventoryDataLoading, error: inventoryDataError } = useInventoryInfo(name);
    // const {
    //     data: currentSnapshotData,
    //     isLoading: currentSnapshotDataLoading,
    //     mutate: mutateCurrentSnapshot
    // } = useCurrentSnapshot(name);
    const [currentSnapshotData, mutateCurrentSnapshot] = useOptimistic(
        snapshot,
        (state, newState: InventorySnapshotWithExtras) => (newState)
    )

    return (
        <div className="default-container p-12 tablet:px-2">
            <InventoryStockTable
                type="server-data"
                inventoryName={name}
                currentSnapshot={currentSnapshotData}
                mutateCurrentSnapshot={mutateCurrentSnapshot}
                mutationAllowed={hasAnyPermission(userData.permissions, [Permission.CREATE_INVENTORY, Permission.MUTATE_STOCK])}
            />
        </div>
    );
}