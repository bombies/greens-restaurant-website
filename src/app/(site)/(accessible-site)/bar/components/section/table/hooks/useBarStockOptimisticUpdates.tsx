"use client";

import { useCallback } from "react";
import { errorToast } from "../../../../../../../../utils/Hooks";
import { PartialStockSnapshotWithStock } from "../BarStockTable";
import useBarStockDelete from "./useBarStockDelete";
import useBarStockUpdate from "./useBarStockUpdate";
import { InventorySection, StockSnapshot } from "@prisma/client";
import { KeyedMutator } from "swr";
import { InventorySectionSnapshotWithOptionalExtras } from "../../../../../../../api/inventory/bar/[name]/types";

type Props = {
    barName?: string,
    section?: InventorySection,
    currentSnapshot?: InventorySectionSnapshotWithOptionalExtras
    mutateCurrentSnapshot?: KeyedMutator<InventorySectionSnapshotWithOptionalExtras | undefined>
}

const useBarStockOptimisticUpdates = ({ barName, section, currentSnapshot, mutateCurrentSnapshot }: Props) => {
    const { trigger: deleteBarStock } = useBarStockDelete(barName, section?.id);
    const { trigger: updateBarStock } = useBarStockUpdate(barName, section?.id);

    const addOptimisticStockItem = useCallback(async (item: StockSnapshot) => {
        if (!currentSnapshot)
            return;

        if (mutateCurrentSnapshot) {
            await mutateCurrentSnapshot({
                ...currentSnapshot,
                stockSnapshots: currentSnapshot.stockSnapshots?.length ? [...currentSnapshot.stockSnapshots, item] : [item]
            });
        }
    }, [currentSnapshot, mutateCurrentSnapshot]);

    const removeOptimisticStockItems = useCallback(async (itemUIDs: string[]) => {
        if (!currentSnapshot)
            return;

        const stockSnapshots = currentSnapshot.stockSnapshots?.filter(item => !itemUIDs.includes(item.uid));
        if (mutateCurrentSnapshot) {
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
                        stockSnapshots: stockSnapshots ?? []
                    },
                    revalidate: false
                });
        }
    }, [currentSnapshot, deleteBarStock, mutateCurrentSnapshot]);

    const updateOptimisticStockSnapshot = useCallback(async (item: PartialStockSnapshotWithStock, quantity?: number) => {
        if (!currentSnapshot)
            return;

        const snapshots = currentSnapshot.stockSnapshots ? [...currentSnapshot.stockSnapshots] : [];
        const foundIndex = snapshots.findIndex(i => i.uid === item.uid);
        if (foundIndex === -1)
            return;

        const snapshot = snapshots[foundIndex];
        snapshots[foundIndex] = {
            ...snapshot,
            ...item,
            quantity: (quantity ?? snapshot.quantity) ?? 0
        };

        if (mutateCurrentSnapshot) {
            await mutateCurrentSnapshot(
                updateBarStock({
                    stockUID: snapshot.uid,
                    dto: { quantity, sellingPrice: item.sellingPrice }
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
                        stockSnapshots: snapshots ?? []
                    },
                    revalidate: false
                });
        }
    }, [currentSnapshot, mutateCurrentSnapshot, updateBarStock]);

    return { addOptimisticStockItem, removeOptimisticStockItems, updateOptimisticStockSnapshot };
};

export default useBarStockOptimisticUpdates;