"use client";

import { KeyedMutator } from "swr";
import useInventoryStockUpdate from "./useInventoryStockUpdate";
import useInventoryStockDelete from "./useInventoryStockDelete";
import { useCallback } from "react";
import { errorToast } from "../../../../../../../../utils/Hooks";
import {
    PartialStockSnapshotWithStock
} from "../../../../../locations/[location]/components/section/table/LocationStockTable";
import { StockSnapshot } from "@prisma/client";
import { InventorySnapshotWithExtras } from "../../../../../../../api/inventory/[name]/types";

type Props = {
    inventoryName: string,
    currentSnapshot?: InventorySnapshotWithExtras,
    mutateCurrentSnapshot: KeyedMutator<InventorySnapshotWithExtras | undefined>
}

const useInventoryStockOptimisticUpdates = ({ inventoryName, currentSnapshot, mutateCurrentSnapshot }: Props) => {
    const { trigger: updateStock } = useInventoryStockUpdate(inventoryName);
    const { trigger: deleteStock } = useInventoryStockDelete(inventoryName);

    const addOptimisticStockItem = useCallback(async (item: StockSnapshot) => {
        if (!currentSnapshot)
            return;

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

                    return ({
                        ...currentSnapshot
                    });
                }),
            {
                optimisticData: {
                    ...currentSnapshot,
                    stockSnapshots
                },
                revalidate: false
            });
    }, [currentSnapshot, deleteStock, mutateCurrentSnapshot]);

    const updateOptimisticStockSnapshot = useCallback(async (item: PartialStockSnapshotWithStock & {
        uid: string
    }, quantity?: number) => {
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
                dto: { quantity, price: item.price, name: item.name, type: item.type ?? undefined }
            })
                .then(() => ({
                    ...currentSnapshot,
                    stockSnapshots: snapshots
                }))
                .catch(e => {
                    console.error(e);
                    errorToast(e, `Could not update ${item.name?.replaceAll("-", " ")}!`);

                    return ({
                        ...currentSnapshot
                    });
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