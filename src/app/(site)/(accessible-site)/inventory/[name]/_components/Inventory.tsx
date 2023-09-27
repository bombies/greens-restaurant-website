"use client";

import { Inventory, InventorySnapshot, Stock } from "@prisma/client";
import useSWR from "swr";
import { fetcher } from "../../../employees/_components/EmployeeGrid";
import { useEffect } from "react";
import { notFound, useRouter } from "next/navigation";
import { hasAnyPermission, Permission } from "../../../../../../libs/types/permission";
import InventoryStockTable, { columns } from "./table/InventoryStockTable";
import { useUserData } from "../../../../../../utils/Hooks";
import TableSkeleton from "../../../../../_components/skeletons/TableSkeleton";
import { InventorySnapshotWithExtras } from "../../../../../api/inventory/[name]/types";
import { AxiosError } from "axios";

type Props = {
    name: string
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

export default function Inventory({ name }: Props) {
    const { isLoading: userDataIsLoading, data: userData } = useUserData();
    const { isLoading: inventoryDataLoading, error: inventoryDataError } = useInventoryInfo(name);
    const {
        data: currentSnapshotData,
        isLoading: currentSnapshotDataLoading,
        mutate: mutateCurrentSnapshot
    } = useCurrentSnapshot(name);
    const router = useRouter();

    useEffect(() => {
        if (!userDataIsLoading &&
            (!userData || !hasAnyPermission(userData.permissions, [
                Permission.VIEW_INVENTORY,
                Permission.CREATE_INVENTORY,
                Permission.MUTATE_STOCK
            ]))
        )
            return router.push("/home");
    }, [router, userData, userDataIsLoading]);

    useEffect(() => {
        if (!inventoryDataError || !(inventoryDataError instanceof AxiosError))
            return;
        const status = inventoryDataError.response!.status;
        if (status === 404)
            notFound();
    }, [inventoryDataError]);

    return (
        <div className="default-container p-12 phone:px-4">
            {
                inventoryDataLoading || currentSnapshotDataLoading ?
                    <TableSkeleton columns={columns} contentRepeat={20} />
                    :
                    !inventoryDataError ?
                        <InventoryStockTable
                            inventoryName={name}
                            currentSnapshot={currentSnapshotData}
                            mutateCurrentSnapshot={mutateCurrentSnapshot}
                            snapshotLoading={currentSnapshotDataLoading}
                            mutationAllowed={hasAnyPermission(userData?.permissions, [Permission.CREATE_INVENTORY, Permission.MUTATE_STOCK])}
                        />
                        :
                        <div>There was an error</div>
            }
        </div>
    );
}