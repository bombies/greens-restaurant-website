"use client";

import { FC, Fragment, useCallback } from "react";
import GenericStockTable, { StockTableColumnKey } from "../../inventory/[name]/_components/table/generic/GenericStockTable";
import { KeyedMutator } from "swr";
import {
    InventorySectionSnapshotWithExtras,
    StockSnapshotWithStock
} from "../../../../api/inventory/[name]/utils";

type Props = {
    currentSnapshot?: InventorySectionSnapshotWithExtras
    mutateCurrentSnapshot: KeyedMutator<InventorySectionSnapshotWithExtras | undefined>
    stockIsLoading: boolean,
    mutationAllowed: boolean,
}

const BarStockTable: FC<Props> = ({ currentSnapshot, mutateCurrentSnapshot, stockIsLoading, mutationAllowed }) => {
    const addOptimisticStockItem = useCallback(async (item: StockSnapshotWithStock) => {
        await mutateCurrentSnapshot({
            ...currentSnapshot,
            stockSnapshots: currentSnapshot?.stockSnapshots ? [...currentSnapshot.stockSnapshots, item] : [item]
        });
    }, [currentSnapshot, mutateCurrentSnapshot]);

    return (
        <Fragment>
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
                    // TODO
                }}
            />
        </Fragment>
    );
};

export default BarStockTable;