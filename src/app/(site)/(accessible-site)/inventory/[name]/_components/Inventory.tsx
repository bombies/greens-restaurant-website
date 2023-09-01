"use client";

import { Inventory, InventorySnapshot, Stock, StockSnapshot } from "@prisma/client";
import useSWR from "swr";
import { fetcher } from "../../../employees/_components/EmployeeGrid";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { hasAnyPermission, Permission } from "../../../../../../libs/types/permission";
import InventoryStockTable, { columns } from "./table/InventoryStockTable";
import SubTitle from "../../../../../_components/text/SubTitle";
import { useUserData } from "../../../../../../utils/Hooks";
import TableSkeleton from "../../../../../_components/skeletons/TableSkeleton";
import { useCurrentStock } from "./CurrentStockContext";
import { InventoryType } from ".prisma/client";

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
    return useSWR(`/api/inventory/${name}/currentsnapshot`, fetcher<InventorySnapshot & {
        inventory: Inventory & { stock: Stock[] },
        stockSnapshots: StockSnapshot[]
    }>);
};

export default function Inventory({ name }: Props) {
    const { isLoading: userDataIsLoading, data: userData } = useUserData();
    const { data: inventoryData, isLoading: inventoryDataLoading, error: inventoryDataError } = useInventoryInfo(name);
    const { data: currentSnapshotData, isLoading: currentSnapshotDataLoading } = useCurrentSnapshot(name);
    const [currentStockSnapshot, setCurrentStockSnapshot] = useCurrentStock();
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
        if ((!inventoryDataLoading && (!inventoryData || inventoryDataError)) || (!currentSnapshotDataLoading && !currentSnapshotData))
            return router.replace("/inventory");
        else if (!currentSnapshotDataLoading && currentSnapshotData)
            setCurrentStockSnapshot(currentSnapshotData.inventory.stock.map(stock => {
                return ({
                    id: currentSnapshotData.stockSnapshots.find(snapshot => snapshot.uid === stock.uid)?.id || "",
                    name: stock.name,
                    quantity: currentSnapshotData.stockSnapshots.find(snapshot => snapshot.uid === stock.uid)?.quantity || 0,
                    uid: stock.uid,
                    type: InventoryType.DEFAULT,
                    inventorySnapshotId: currentSnapshotData.id,
                    inventoryId: currentSnapshotData.inventoryId,
                    createdAt: currentSnapshotData.stockSnapshots.find(snapshot => snapshot.uid === stock.uid)?.createdAt || new Date(),
                    updatedAt: currentSnapshotData.stockSnapshots.find(snapshot => snapshot.uid === stock.uid)?.updatedAt || new Date()
                });
            }));
    }, [currentSnapshotData, currentSnapshotDataLoading, inventoryData, inventoryDataError, inventoryDataLoading, router, setCurrentStockSnapshot]);

    return (
        <div className="default-container p-12 phone:px-4">
            {
                currentSnapshotDataLoading ?
                    <TableSkeleton columns={columns} contentRepeat={20} />
                    :
                    !inventoryDataError ?
                        (currentStockSnapshot.length > 0 ?
                                <InventoryStockTable
                                    inventoryName={name}
                                    stock={currentStockSnapshot}
                                    mutationAllowed={hasAnyPermission(userData?.permissions, [Permission.CREATE_INVENTORY, Permission.MUTATE_STOCK])}
                                />
                                :
                                <div className="default-container p-12">
                                    <SubTitle>There are no items...</SubTitle>
                                </div>
                        )
                        :
                        <div>There was an error</div>
            }
        </div>
    );
}