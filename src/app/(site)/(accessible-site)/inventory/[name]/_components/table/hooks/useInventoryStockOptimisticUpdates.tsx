"use client";

import { InventorySnapshotWithExtras } from "../../../../../../../api/inventory/[name]/utils";
import { KeyedMutator } from "swr";
import useInventoryStockUpdate from "./useInventoryStockUpdate";
import useInventoryStockDelete from "./useInventoryStockDelete";
import { useCallback } from "react";
import { errorToast } from "../../../../../../../../utils/Hooks";
import { PartialStockSnapshotWithStock } from "../../../../../bar/components/section/table/BarStockTable";
import { StockSnapshot } from "@prisma/client";

type Props = {
    inventoryName: string,
    currentSnapshot?: InventorySnapshotWithExtras,
    mutateCurrentSnapshot: KeyedMutator<InventorySnapshotWithExtras | undefined>
}

const useInventoryStockOptimisticUpdates = ({ inventoryName, currentSnapshot, mutateCurrentSnapshot }: Props) => {
    const { trigger: updateStock } = useInventoryStockUpdate(inventoryName);
    const { trigger: deleteStock } = useInventoryStockDelete(inventoryName);

    const addOptimisticStockItem = useCallback(async (item: StockSnapshot) => {
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
            deleteStock({
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
    }, [currentSnapshot, deleteStock, mutateCurrentSnapshot]);

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
            quantity: (quantity ?? snapshot.quantity) ?? 0
        };

        await mutateCurrentSnapshot(
            updateStock({
                stockUID: snapshot.uid,
                dto: { quantity, price: item.price, name: item.name }
            })
                .then(() => ({
                    ...currentSnapshot,
                    stockSnapshots: snapshots
                }))
                .catch(e => {
                    console.error(e);
                    errorToast(e, `Could not update ${item.name?.replaceAll("-", " ")}!`);
                }),
            {
                optimisticData: {
                    ...currentSnapshot,
                    stockSnapshots: snapshots
                },
                revalidate: false
            });
    }, [currentSnapshot, mutateCurrentSnapshot, updateStock]);

    return { addOptimisticStockItem, removeOptimisticStockItems, updateOptimisticStockSnapshot };
};

export default useInventoryStockOptimisticUpdates;