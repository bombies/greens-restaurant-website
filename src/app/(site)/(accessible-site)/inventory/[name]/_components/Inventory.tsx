"use client";

import { Config, Inventory, User } from "@prisma/client";
import { hasAnyPermission, Permission } from "../../../../../../libs/types/permission";
import InventoryStockTable from "./table/InventoryStockTable";
import { InventorySnapshotWithExtras } from "../../../../../api/inventory/[name]/types";
import { DeepRequired } from "react-hook-form";
import useOptimistic from "@/app/hooks/useOptimistic";
import { useEffect, useMemo, useState } from "react";
import { itemHasLowStock } from "../../utils/inventory-utils";
import { AnimatePresence, motion } from "framer-motion";
import { Tab, Tabs } from "@nextui-org/react";
import GenericTabs from "@/app/_components/GenericTabs";
import ToastComponent from "@/app/_components/ToastComponent";
import { AlertTriangleIcon } from "lucide-react";
import toast from "react-hot-toast";

type Props = {
    name: string,
    config: DeepRequired<Config>,
    snapshot: InventorySnapshotWithExtras,
    userData: User
}

export default function Inventory({ name, config, snapshot, userData }: Props) {
    const [lowStockMessageShown, setLowStockMessageShown] = useState(false);

    const [currentSnapshotData, mutateCurrentSnapshot] = useOptimistic(
        snapshot,
        (state, newState: InventorySnapshotWithExtras) => (newState)
    )

    const lowStockSnapshot = useMemo(() => {
        const lowStock = currentSnapshotData
            .stockSnapshots
            .filter(item => itemHasLowStock(config, item))
        return { ...currentSnapshotData, stockSnapshots: lowStock }
    }, [config, currentSnapshotData])

    const stockTable = useMemo(() => (
        <InventoryStockTable
            type="server-data"
            inventoryName={name}
            currentSnapshot={currentSnapshotData}
            mutateCurrentSnapshot={mutateCurrentSnapshot}
            mutationAllowed={hasAnyPermission(userData.permissions, [Permission.CREATE_INVENTORY, Permission.MUTATE_STOCK])}
        />
    ), [currentSnapshotData, mutateCurrentSnapshot, name, userData.permissions])

    return (
        <div className="default-container p-12 tablet:px-2">
            {lowStockSnapshot.stockSnapshots.length > 0 ? (
                <GenericTabs>
                    <Tab title="Stock">
                        {stockTable}
                    </Tab>
                    <Tab title="Low Stock">
                        <InventoryStockTable
                            type="read-only"
                            inventoryName={name}
                            currentSnapshot={lowStockSnapshot}
                            mutationAllowed={false}
                        />
                    </Tab>
                </GenericTabs>
            ) : (
                stockTable
            )}
        </div>
    );
}