"use client";

import { Inventory, InventorySnapshot, Stock, StockSnapshot } from "@prisma/client";
import useSWR from "swr";
import { fetcher } from "../../../employees/_components/EmployeeGrid";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { hasAnyPermission, Permission } from "../../../../../../libs/types/permission";
import StockTable from "./table/StockTable";
import { Spacer } from "@nextui-org/spacer";
import Title from "../../../../../_components/text/Title";
import SpecificInventoryControlBar from "./SpecificInventoryControlBar";
import SubTitle from "../../../../../_components/text/SubTitle";
import { useUserData } from "../../../../../../utils/Hooks";

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
    const { data: inventoryData, isLoading: inventoryDataLoading } = useInventoryInfo(name);
    const { data: currentSnapshotData, isLoading: currentSnapshotDataLoading } = useCurrentSnapshot(name);
    const [currentStockSnapshot, setCurrentStockSnapshot] = useState<StockSnapshot[]>([]);
    const router = useRouter();

    useEffect(() => {
        if (!userDataIsLoading &&
            (!userData || !hasAnyPermission(userData.permissions, [
                Permission.VIEW_INVENTORY,
                Permission.CREATE_INVENTORY,
                Permission.MUTATE_STOCK
            ]))
        )
            router.replace("/home");
    }, [router, userData, userDataIsLoading]);

    useEffect(() => {
        if ((!inventoryDataLoading && !inventoryData) || (!currentSnapshotDataLoading && !currentSnapshotData))
            router.replace("/inventory");
        else if (!currentSnapshotDataLoading && currentSnapshotData)
            setCurrentStockSnapshot(currentSnapshotData.inventory.stock.map(stock => {
                return ({
                    id: currentSnapshotData.stockSnapshots.find(snapshot => snapshot.uid === stock.uid)?.id || "",
                    name: stock.name,
                    quantity: currentSnapshotData.stockSnapshots.find(snapshot => snapshot.uid === stock.uid)?.quantity || 0,
                    uid: stock.uid,
                    inventorySnapshotId: currentSnapshotData.id,
                    createdAt: currentSnapshotData.stockSnapshots.find(snapshot => snapshot.uid === stock.uid)?.createdAt || new Date(),
                    updatedAt: currentSnapshotData.stockSnapshots.find(snapshot => snapshot.uid === stock.uid)?.updatedAt || new Date()
                });
            }));
    }, [currentSnapshotData, currentSnapshotDataLoading, inventoryData, inventoryDataLoading, router]);

    return (
        <>
            <Title>Inventory - <span
                className="text-primary capitalize">{inventoryData?.name.replaceAll("-", " ") || "Unknown"}</span></Title>
            <Spacer y={6} />
            <SpecificInventoryControlBar
                inventoryName={name}
                setCurrentData={setCurrentStockSnapshot}
                controlsEnabled={hasAnyPermission(userData?.permissions, [Permission.CREATE_INVENTORY, Permission.MUTATE_STOCK])}
            />
            <Spacer y={6} />
            <div className="default-container p-12 phone:px-4">
                {
                    currentSnapshotDataLoading ? <div>Loading...</div> :
                        currentStockSnapshot.length > 0 ?
                            <StockTable
                                inventoryName={name}
                                stock={currentStockSnapshot}
                                mutationAllowed={hasAnyPermission(userData?.permissions, [Permission.CREATE_INVENTORY, Permission.MUTATE_STOCK])}
                            />
                            :
                            <div className="default-container p-12">
                                <SubTitle>There are no items...</SubTitle>
                            </div>
                }
            </div>
        </>
    );
}