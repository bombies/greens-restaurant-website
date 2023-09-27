"use client";

import useSWR from "swr";
import { fetcher } from "../../../../../employees/_components/EmployeeGrid";
import { useEffect } from "react";
import { notFound, useRouter } from "next/navigation";
import InventoryStockTable, { columns } from "../../../_components/table/InventoryStockTable";
import TableSkeleton from "../../../../../../../_components/skeletons/TableSkeleton";
import { Spacer } from "@nextui-org/react";
import SubTitle from "../../../../../../../_components/text/SubTitle";
import { InventorySnapshotWithExtras } from "../../../../../../../api/inventory/[name]/types";
import { AxiosError } from "axios";

type Props = {
    inventoryName: string,
    snapshotId: string,
}

const FetchSpecificSnapshot = (inventoryName: string, snapshotId: string) => {
    return useSWR(`/api/inventory/${inventoryName}/snapshots/${snapshotId}`, fetcher<InventorySnapshotWithExtras>);
};

export default function SpecificSnapshotContainer({ inventoryName, snapshotId }: Props) {
    const { data, isLoading, mutate, error } = FetchSpecificSnapshot(inventoryName, snapshotId);
    const router = useRouter();
    useEffect(() => {
        if (error && error instanceof AxiosError) {
            const status = error.response!.status;
            if (status === 404)
                notFound();
        }

        if (
            ((!isLoading && data)
                &&
                (new Date(data.createdAt).setHours(0, 0, 0, 0) === new Date().setHours(0, 0, 0, 0)))
            || (!isLoading && !data)
        )
            router.replace(`/inventory/${inventoryName}`);
    }, [data, error, inventoryName, isLoading, router]);

    return (
        <>
            {
                (!isLoading && data) && (
                    <>
                        <div className="default-container p-12">
                            <SubTitle>You are currently viewing the inventory snapshot
                                for {new Date(data.createdAt).toLocaleDateString("en-JM")}</SubTitle>
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
                            currentSnapshot={data}
                            snapshotLoading={isLoading}
                            mutationAllowed={false}
                            mutateCurrentSnapshot={mutate}
                        />
                }
            </div>
        </>

    );
}