"use client";

import { Config, Inventory, User } from "@prisma/client";
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

export default function Inventory({ name, config, snapshot, userData }: Props) {
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