"use client";

import useSWR from "swr";
import { fetcher } from "../employees/_components/EmployeeGrid";
import { Inventory } from "@prisma/client";
import { InventorySnapshotWithInventoryAndStockSnapshots } from "../../../api/inventory/[name]/utils";
import { Spinner } from "@nextui-org/spinner";

const useBarInfo = () => {
    return useSWR("/api/inventory/bar", fetcher<Inventory>);
};

const useCurrentBarSnapshot = (name?: string) => {
    return useSWR(`/api/inventory/bar/${name}/currentsnapshot`, fetcher<InventorySnapshotWithInventoryAndStockSnapshots>);
};

export default function BarPage() {
    const { data: barInfo, isLoading: barInfoLoading } = useBarInfo();
    const { data: currentSnapshot, isLoading: currentSnapshotLoading } = useCurrentBarSnapshot(barInfo?.name);

    return (
        <div>
            {
                barInfoLoading || currentSnapshotLoading ?
                    <Spinner />
                    :
                    JSON.stringify(currentSnapshot)
            }
        </div>
    );
}