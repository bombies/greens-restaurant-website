"use client";

import type { Config, Inventory, StockSnapshot, User } from "@prisma/client";
import { hasAnyPermission, Permission } from "../../../../../../libs/types/permission";
import InventoryStockTable from "./table/InventoryStockTable";
import { InventorySnapshotWithExtras } from "../../../../../api/inventory/[name]/types";
import { DeepRequired } from "react-hook-form";
import useOptimistic from "@/app/hooks/useOptimistic";
import { useMemo, useReducer } from "react";
import { itemHasLowStock } from "../../utils/inventory-utils";
import { Tab } from "@nextui-org/react";
import GenericTabs from "@/app/_components/GenericTabs";

type Props = {
    name: string,
    config: DeepRequired<Config>,
    snapshot: InventorySnapshotWithExtras,
    userData: User
}

export enum OptimisticSnapshotAction {
    ADD_STOCK_ITEM,
    ADD_STOCK_ITEMS,
    DELETE_STOCK_ITEMS,
    UPDATE_STOCK_ITEM
}

export type OptimisticSnapshotPayload = {
    type: OptimisticSnapshotAction.ADD_STOCK_ITEM,
    payload: StockSnapshot
} | {
    type: OptimisticSnapshotAction.DELETE_STOCK_ITEMS,
    payload: string[]
} | {
    type: OptimisticSnapshotAction.UPDATE_STOCK_ITEM,
    payload: StockSnapshot
} | {
    type: OptimisticSnapshotAction.ADD_STOCK_ITEMS,
    payload: StockSnapshot[]
}

export default function Inventory({ name, config, snapshot, userData }: Props) {
    const [currentSnapshotData, mutateCurrentSnapshot] = useReducer(
        (state: InventorySnapshotWithExtras, payload: OptimisticSnapshotPayload) => {
            switch (payload.type) {
                case OptimisticSnapshotAction.ADD_STOCK_ITEM:
                    return {
                        ...state,
                        stockSnapshots: [...state.stockSnapshots, payload.payload]
                    }
                case OptimisticSnapshotAction.ADD_STOCK_ITEMS:
                    return {
                        ...state,
                        stockSnapshots: state.stockSnapshots.concat(payload.payload)
                    }
                case OptimisticSnapshotAction.DELETE_STOCK_ITEMS:
                    return {
                        ...state,
                        stockSnapshots: state.stockSnapshots.filter(item => !payload.payload.includes(item.uid))
                    }
                case OptimisticSnapshotAction.UPDATE_STOCK_ITEM:
                    return {
                        ...state,
                        stockSnapshots: state.stockSnapshots.map(item => item.id === payload.payload.id ? payload.payload : item)
                    }
            }
        },
        snapshot
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
