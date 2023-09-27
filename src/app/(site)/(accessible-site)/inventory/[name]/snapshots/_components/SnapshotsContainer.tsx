"use client";

import useSWR from "swr";
import { fetcher } from "../../../../employees/_components/EmployeeGrid";
import { Inventory, InventorySnapshot } from "@prisma/client";
import { useEffect } from "react";
import { hasAnyPermission, Permission } from "../../../../../../../libs/types/permission";
import { useUserData } from "../../../../../../../utils/Hooks";
import { notFound, useRouter } from "next/navigation";
import SnapshotCard from "./SnapshotCard";
import CardSkeleton from "../../../../../../_components/skeletons/CardSkeleton";
import SubTitle from "../../../../../../_components/text/SubTitle";
import { AxiosError } from "axios";

type Props = {
    inventoryName: string,
}

const FetchSnapshots = (inventoryName: string) => {
    return useSWR(`/api/inventory/${inventoryName}/snapshots`, fetcher<Inventory & { snapshots: InventorySnapshot[] }>);
};

export default function SnapshotsContainer({ inventoryName }: Props) {
    const { data, isLoading, error } = FetchSnapshots(inventoryName);
    const { isLoading: userDataIsLoading, data: userData } = useUserData();
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
        if (!error || !(error instanceof AxiosError))
            return;
        const status = error.response!.status;
        if (status === 404)
            notFound();
    }, [error]);

    const cards = data?.snapshots
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .map(snapshot => (
            <SnapshotCard
                key={snapshot.id}
                inventoryName={inventoryName}
                snapshot={snapshot}
            />
        ));

    return (
        <div className="default-container p-12 grid grid-cols-3 tablet:grid-cols-2 phone:grid-cols-1 gap-4">
            {
                isLoading ? <>
                        <CardSkeleton />
                        <CardSkeleton />
                        <CardSkeleton />
                        <CardSkeleton />
                        <CardSkeleton />
                        <CardSkeleton />
                    </> :
                    cards || <SubTitle>There are no snapshots...</SubTitle>
            }
        </div>
    );
}