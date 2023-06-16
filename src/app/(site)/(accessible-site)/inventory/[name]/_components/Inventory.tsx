"use client";

import { Inventory, InventorySnapshot, Stock, StockSnapshot } from "@prisma/client";
import useSWR from "swr";
import { fetcher } from "../../../employees/_components/EmployeeGrid";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { hasAnyPermission, Permission } from "../../../../../../libs/types/permission";
import StockTable from "./StockTable";
import { Spacer } from "@nextui-org/spacer";
import Title from "../../../../../_components/text/Title";
import SpecificInventoryControlBar from "./SpecificInventoryControlBar";

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
        stockSnapshots: StockSnapshot[]
    }>);
};

export default function Inventory({ name }: Props) {
    const session = useSession();
    const { data: inventoryData, isLoading: inventoryDataLoading } = useInventoryInfo(name);
    const { data: currentSnapshotData, isLoading: currentSnapshotDataLoading } = useCurrentSnapshot(name);
    const [currentStockSnapshot, setCurrentStockSnapshot] = useState<StockSnapshot[]>([]);
    const router = useRouter();

    useEffect(() => {
        if (session.status !== "loading"
            && !hasAnyPermission(session.data?.user?.permissions, [
                Permission.VIEW_INVENTORY,
                Permission.CREATE_INVENTORY,
                Permission.VIEW_INVENTORY
            ])
        )
            router.replace("/home");
    }, [router, session.data?.user?.permissions, session.status]);

    useEffect(() => {
        if ((!inventoryDataLoading && !inventoryData) || (!currentSnapshotDataLoading && !currentSnapshotData))
            router.replace("/inventory");
        else if (!currentSnapshotDataLoading && currentSnapshotData)
            setCurrentStockSnapshot(currentSnapshotData.stockSnapshots);
    }, [currentSnapshotData, currentSnapshotDataLoading, inventoryData, inventoryDataLoading, router]);

    return (
        <>
            <Title>Inventory - <span
                className="text-primary capitalize">{inventoryData?.name.replaceAll("-", " ") || "Unknown"}</span></Title>
            <Spacer y={6} />
            <SpecificInventoryControlBar inventoryName={name} setCurrentData={setCurrentStockSnapshot} />
            <Spacer y={6} />
            <div className="default-container p-12 phone:px-4">
                {
                    !currentSnapshotDataLoading &&
                    <StockTable stock={currentStockSnapshot} />
                }
            </div>

        </>
    );
}