"use client";

import { FC, Fragment, useCallback } from "react";
import GenericStockTable, { StockTableColumnKey } from "./generic/GenericStockTable";
import { StockSnapshot } from "@prisma/client";
import { KeyedMutator } from "swr";
import { InventorySnapshotWithInventoryAndStockSnapshots } from "../../../../../../api/inventory/[name]/utils";

type Props = {
    currentSnapshot?: InventorySnapshotWithInventoryAndStockSnapshots
    mutateCurrentSnapshot: KeyedMutator<InventorySnapshotWithInventoryAndStockSnapshots | undefined>
    stockIsLoading: boolean,
    mutationAllowed: boolean,
}

const BarStockTable: FC<Props> = ({ currentSnapshot, mutateCurrentSnapshot, stockIsLoading, mutationAllowed }) => {
    const addOptimisticStockItem = useCallback(async (item: StockSnapshot) => {
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
                            return item.name.replaceAll("-", " ");
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