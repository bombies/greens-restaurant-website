"use client";

import useSWR from "swr";
import { fetcher } from "../../../../../employees/_components/EmployeeGrid";
import { InventorySnapshot } from "@prisma/client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import InventoryStockTable, { columns } from "../../../_components/table/InventoryStockTable";
import TableSkeleton from "../../../../../../../_components/skeletons/TableSkeleton";
import { Spacer } from "@nextui-org/react";
import SubTitle from "../../../../../../../_components/text/SubTitle";
import { StockSnapshotWithStock } from "../../../../../../../api/inventory/[name]/utils";

type Props = {
    inventoryName: string,
    snapshotId: string,
}

const FetchSpecificSnapshot = (inventoryName: string, snapshotId: string) => {
    return useSWR(`/api/inventory/${inventoryName}/snapshots/${snapshotId}`, fetcher<InventorySnapshot & {
        stockSnapshots: StockSnapshotWithStock[]
    }>);
};

export default function SpecificSnapshotContainer({ inventoryName, snapshotId }: Props) {
    const { data, isLoading } = FetchSpecificSnapshot(inventoryName, snapshotId);
    const router = useRouter();

    useEffect(() => {
        if (
            ((!isLoading && data)
                &&
                (new Date(data.createdAt).setHours(0, 0, 0, 0) === new Date().setHours(0, 0, 0, 0)))
            || (!isLoading && !data)
        )
            router.replace(`/inventory/${inventoryName}`);
    }, [data, inventoryName, isLoading, router]);

    return (
        <>
            {
                (!isLoading && data) && (
                    <>
                        <div className="default-container p-12">
                            <SubTitle>You are currently viewing the inventory snapshot
                                for {new Date(data.createdAt).toDateString()}</SubTitle>
                        </div>
                        <Spacer y={6} />
                    </>
                )
            }
            <div className="default-container p-12 phone:px-4">
                {
                    isLoading ?
                        <TableSkeleton columns={columns} contentRepeat={20} />
                        :
                        data &&
                        <InventoryStockTable
                            inventoryName={inventoryName}
                            stock={data!.stockSnapshots}
                            mutationAllowed={false}
                        />
                }
            </div>
        </>

    );
}