"use client";

import { FC, Fragment, useCallback, useState } from "react";
import GenericStockTable, {
    StockTableColumnKey
} from "../../../inventory/[name]/_components/table/generic/GenericStockTable";
import { KeyedMutator } from "swr";
import {
    InventorySectionSnapshotWithExtras,
    StockSnapshotWithStock
} from "../../../../../api/inventory/[name]/utils";
import { InventorySection, Stock } from "@prisma/client";
import AddBarSectionStockModal from "./AddBarSectionStockModal";

type Props = {
    barName?: string,
    section?: InventorySection
    currentSnapshot?: InventorySectionSnapshotWithExtras
    mutateCurrentSnapshot: KeyedMutator<InventorySectionSnapshotWithExtras | undefined>
    stockIsLoading: boolean,
    mutationAllowed: boolean,
}

export type PartialStock = Partial<Omit<Stock, "id">>

const BarStockTable: FC<Props> = ({ barName, section, currentSnapshot, mutateCurrentSnapshot, stockIsLoading, mutationAllowed }) => {
    const [addItemModelOpen, setAddItemModalOpen] = useState(false);

    const addOptimisticStockItem = useCallback(async (item: StockSnapshotWithStock) => {
        await mutateCurrentSnapshot({
            ...currentSnapshot,
            stockSnapshots: currentSnapshot?.stockSnapshots ? [...currentSnapshot.stockSnapshots, item] : [item]
        });
    }, [currentSnapshot, mutateCurrentSnapshot]);

    const removeOptimisticStockItem = useCallback(async (item: Stock) => {
        if (!currentSnapshot)
            return;

        const stockSnapshots = currentSnapshot.stockSnapshots;
        const itemIndex = stockSnapshots.findIndex(i => item.id === item.id);
        if (itemIndex === -1)
            return;
        stockSnapshots.splice(itemIndex);

        await mutateCurrentSnapshot({
            ...currentSnapshot,
            stockSnapshots
        });
    }, [currentSnapshot, mutateCurrentSnapshot]);

    const updateOptimisticStockItem = useCallback(async (item: PartialStock) => {

    }, []);

    return (
        <Fragment>
            <AddBarSectionStockModal
                barName={barName}
                section={section}
                isOpen={addItemModelOpen}
                setOpen={setAddItemModalOpen}
            />
            <GenericStockTable
                stock={currentSnapshot?.stockSnapshots ?? []}
                stockLoading={stockIsLoading}
                mutationAllowed={mutationAllowed}
                getKeyValue={(item, key) => {
                    switch (key) {
                        case StockTableColumnKey.STOCK_NAME: {
                            return item.stock.name.replaceAll("-", " ");
                        }
                        case StockTableColumnKey.STOCK_QUANTITY: {
                            // TODO: Implement stock quantity inline update
                            return item.quantity.toString();
                        }
                    }
                }}
                onQuantityIncrement={() => {
                    // TODO
                }}
                onQuantityDecrement={() => {
                    // TODO
                }}
                onStockDelete={() => {
                    // TODO
                }}
                onItemAddButtonPress={() => {
                    setAddItemModalOpen(true);
                }}
            />
        </Fragment>
    );
};

export default BarStockTable;