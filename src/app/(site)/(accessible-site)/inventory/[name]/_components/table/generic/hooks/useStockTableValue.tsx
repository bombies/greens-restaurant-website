"use client";

import { StockTableColumnKey } from "../GenericStockTable";
import { Key, useCallback } from "react";
import StockTableActions from "../StockTableActions";
import { StockSnapshot } from "@prisma/client";

type Props = {
    getKeyValue: (item: StockSnapshot, key: StockTableColumnKey) => any,
    mutationAllowed: boolean,
    onQuantityIncrement: (item: StockSnapshot, incrementedBy: number) => Promise<void>,
    onQuantityDecrement: (item: StockSnapshot, decrementedBy: number) => Promise<void>,
    onStockDelete: (deletedIds: string[]) => Promise<void>;
}

const useStockTableValue = ({
                                getKeyValue,
                                mutationAllowed,
                                onQuantityDecrement,
                                onQuantityIncrement,
                                onStockDelete
                            }: Props) => {

    return useCallback((item: StockSnapshot, key: Key) => {
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