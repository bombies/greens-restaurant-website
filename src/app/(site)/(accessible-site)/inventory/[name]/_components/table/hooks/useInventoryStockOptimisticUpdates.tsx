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
import { revalidatePath } from "next/cache";
import { OptimisticMutator } from "@/app/hooks/useOptimistic";
import toast from "react-hot-toast";

type DefaultProps = {
    inventoryName: string,
    currentSnapshot?: InventorySnapshotWithExtras,
}

type Props = ({
    type?: "client-data"
    mutateCurrentSnapshot: KeyedMutator<InventorySnapshotWithExtras | undefined>
} | {
    type: "server-data",
    mutateCurrentSnapshot: OptimisticMutator<InventorySnapshotWithExtras>
}) & DefaultProps

const useInventoryStockOptimisticUpdates = ({ type, inventoryName, currentSnapshot, mutateCurrentSnapshot }: Props) => {
    const { trigger: updateStock } = useInventoryStockUpdate(inventoryName);
    const { trigger: deleteStock } = useInventoryStockDelete(inventoryName);

    const addOptimisticStockItem = useCallback(async (item: StockSnapshot) => {
        if (!currentSnapshot)
            return;

        if (!type || type === 'client-data')
            await mutateCurrentSnapshot({
                ...currentSnapshot,
                stockSnapshots: currentSnapshot?.stockSnapshots ? [...currentSnapshot.stockSnapshots, item] : [item]
            });
        else if (type === 'server-data') {
            mutateCurrentSnapshot({
                ...currentSnapshot,
                stockSnapshots: currentSnapshot?.stockSnapshots ? [...currentSnapshot.stockSnapshots, item] : [item]
            })
        }

        toast.success(`Added ${item.name?.replaceAll("-", " ")} to inventory!`)
    }, [currentSnapshot, mutateCurrentSnapshot, type]);

    const removeOptimisticStockItems = useCallback(async (itemUIDs: string[]) => {
        if (!currentSnapshot)
            return;

        const stockSnapshots = currentSnapshot.stockSnapshots.filter(item => !itemUIDs.includes(item.uid));
        const deletedItems = currentSnapshot.stockSnapshots.filter(item => itemUIDs.includes(item.uid));
        if (!type || type === 'client-data')
            await mutateCurrentSnapshot(
                deleteStock({
                    body: {
                        ids: itemUIDs.toString()
                    }
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
        else if (type === 'server-data') {
            mutateCurrentSnapshot({
                ...currentSnapshot,
                stockSnapshots
            })

            if (deletedItems.length === 1)
                toast.success(`Deleted ${deletedItems[0].name?.replaceAll("-", " ")} from inventory!`)
            else
                toast.success(`Deleted ${itemUIDs.length} items from inventory!`)

            deleteStock({
                body: {
                    ids: itemUIDs.toString()
                }
            })
        }
    }, [currentSnapshot, deleteStock, mutateCurrentSnapshot, type]);

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

        if (!type || type === 'client-data')
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
        else if (type === 'server-data') {
            mutateCurrentSnapshot({
                ...currentSnapshot,
                stockSnapshots: snapshots
            })

            toast.success(`Updated ${item.name?.replaceAll("-", " ")}!`)

            updateStock({
                stockUID: snapshot.uid,
                dto: { quantity, price: item.price, name: item.name, type: item.type ?? undefined }
            }).catch(e => {
                console.error(e);
                errorToast(e, `Could not update ${item.name?.replaceAll("-", " ")}!`);
                revalidatePath(`/inventory/[name]`)
            })
        }
    }, [currentSnapshot, mutateCurrentSnapshot, type, updateStock]);

    return { addOptimisticStockItem, removeOptimisticStockItems, updateOptimisticStockSnapshot };
};

export default useInventoryStockOptimisticUpdates;