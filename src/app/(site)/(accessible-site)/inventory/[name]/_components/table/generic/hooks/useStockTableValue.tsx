"use client";

import { StockTableColumnKey } from "../GenericStockTable";
import { Key, useCallback } from "react";
import { StockSnapshotWithStock } from "../../../../../../../../api/inventory/[name]/utils";
import StockTableActions from "../StockTableActions";

type Props = {
    getKeyValue: (item: StockSnapshotWithStock, key: StockTableColumnKey) => any,
    mutationAllowed: boolean,
    onQuantityIncrement: (item: StockSnapshotWithStock, incrementedBy: number) => Promise<void>,
    onQuantityDecrement: (item: StockSnapshotWithStock, decrementedBy: number) => Promise<void>,
    onStockDelete: (deletedIds: string[]) => Promise<void>;
}

const useStockTableValue = ({
                                getKeyValue,
                                mutationAllowed,
                                onQuantityDecrement,
                                onQuantityIncrement,
                                onStockDelete
                            }: Props) => {

    return useCallback((item: StockSnapshotWithStock, key: Key) => {
        switch (key) {
            case "stock_actions": {
                return (
                    <StockTableActions
                        item={item}
                        onQuantityDecrement={onQuantityDecrement}
                        onQuantityIncrement={onQuantityIncrement}
                        onStockDelete={onStockDelete}
                    />
                );
            }
            default: {
                return getKeyValue(item, key as StockTableColumnKey);
            }
        }
    }, [getKeyValue, onQuantityDecrement, onQuantityIncrement, onStockDelete]);
};

export default useStockTableValue;