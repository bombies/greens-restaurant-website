"use client";

import useSWR from "swr";
import { fetcher } from "../../../../employees/_components/EmployeeGrid";
import { Inventory, InventorySnapshot } from "@prisma/client";
import { useEffect } from "react";
import { hasAnyPermission, Permission } from "../../../../../../../libs/types/permission";
import { useUserData } from "../../../../../../../utils/Hooks";
import { useRouter } from "next/navigation";

type Props = {
    inventoryName: string,
}

const FetchSnapshots = (inventoryName: string) => {
    return useSWR(`/api/inventory/${inventoryName}/snapshots`, fetcher<Inventory & { snapshots: InventorySnapshot[] }>);
};

export default function SnapshotsContainer({ inventoryName }: Props) {
    const { data, isLoading } = FetchSnapshots(inventoryName);
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

    return (
        <div>
            {
                isLoading ? <div>Loading...</div> : (
                    JSON.stringify(data?.snapshots)
                )
            }
        </div>
    );
}