"use client";

import { useCallback } from "react";
import {
    InventorySectionSnapshotWithExtras,
    StockSnapshotWithStock
} from "../../../../../../../api/inventory/[name]/utils";
import { errorToast } from "../../../../../../../../utils/Hooks";
import { PartialStockSnapshotWithStock } from "../BarStockTable";
import useBarStockDelete from "./useBarStockDelete";
import useBarStockUpdate from "./useBarStockUpdate";
import { InventorySection } from "@prisma/client";
import { KeyedMutator } from "swr";

type Props = {
    barName?: string,
    section?: InventorySection,
    currentSnapshot?: InventorySectionSnapshotWithExtras
    mutateCurrentSnapshot: KeyedMutator<InventorySectionSnapshotWithExtras | undefined>
}

const useBarStockOptimisticUpdates = ({ barName, section, currentSnapshot, mutateCurrentSnapshot }: Props) => {
    const { trigger: deleteBarStock } = useBarStockDelete(barName, section?.id);
    const { trigger: updateBarStock } = useBarStockUpdate(barName, section?.id);

    const addOptimisticStockItem = useCallback(async (item: StockSnapshotWithStock) => {
        await mutateCurrentSnapshot({
            ...currentSnapshot,
            stockSnapshots: currentSnapshot?.stockSnapshots ? [...currentSnapshot.stockSnapshots, item] : [item]
        });
    }, [currentSnapshot, mutateCurrentSnapshot]);

    const removeOptimisticStockItems = useCallback(async (itemUIDs: string[]) => {
        if (!currentSnapshot)
            return;

        const stockSnapshots = currentSnapshot.stockSnapshots.filter(item => !itemUIDs.includes(item.uid));
        await mutateCurrentSnapshot(
            deleteBarStock({
                uids: itemUIDs
            })
                .then(() => {
                    return {
                        ...currentSnapshot,
                        stockSnapshots
                    };
                })
                .catch(e => {
                    console.error(e);
                    errorToast(e, "Could not delete items!");
                }),
            {
                optimisticData: {
                    ...currentSnapshot,
                    stockSnapshots
                },
                revalidate: false
            });
    }, [currentSnapshot, deleteBarStock, mutateCurrentSnapshot]);

    const updateOptimisticStockSnapshot = useCallback(async (item: PartialStockSnapshotWithStock, quantity?: number) => {
        if (!currentSnapshot)
            return;

        const snapshots = [...currentSnapshot.stockSnapshots];
        const foundIndex = snapshots.findIndex(i => i.uid === item.uid);
        if (foundIndex === -1)
            return;

        const snapshot = snapshots[foundIndex];
        snapshots[foundIndex] = {
            ...snapshot,
            ...item,
            quantity: (quantity ?? item.quantity) ?? 0
        };

        await mutateCurrentSnapshot(
            updateBarStock({
                stockUID: snapshot.uid,
                dto: { quantity }
            })
                .then(() => ({
                    ...currentSnapshot,
                    stockSnapshots: snapshots
                }))
                .catch(e => {
                    console.error(e);
                    errorToast(e, "Could not delete items!");
                }),
            {
                optimisticData: {
                    ...currentSnapshot,
                    stockSnapshots: snapshots
                },
                revalidate: false
            });
    }, [currentSnapshot, mutateCurrentSnapshot, updateBarStock]);

    return { addOptimisticStockItem, removeOptimisticStockItems, updateOptimisticStockSnapshot };
};

export default useBarStockOptimisticUpdates;