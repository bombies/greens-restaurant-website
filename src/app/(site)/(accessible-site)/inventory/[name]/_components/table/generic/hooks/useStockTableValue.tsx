"use client";

import { StockTableColumnKey } from "../GenericStockTable";
import { Key, useCallback } from "react";
import StockTableActions from "../actions/StockTableActions";
import { StockSnapshot, StockType } from "@prisma/client";

type Props = {
    getKeyValue: (item: StockSnapshot, key: StockTableColumnKey) => any,
    mutationAllowed: boolean,
    onQuantityIncrement: (item: StockSnapshot, incrementedBy: number) => Promise<void>,
    onQuantityDecrement: (item: StockSnapshot, decrementedBy: number) => Promise<void>,
    onStockDelete: (deletedIds: string[]) => Promise<void>,
    onItemTypeEdit: (itemUID: string, newType: StockType) => Promise<void>
}

const useStockTableValue = ({
                                getKeyValue,
                                mutationAllowed,
                                onQuantityDecrement,
                                onQuantityIncrement,
                                onStockDelete,
                                onItemTypeEdit
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
                        onItemTypeEdit={onItemTypeEdit}
                    />
                );
            }
            default: {
                return getKeyValue(item, key as StockTableColumnKey);
            }
        }
    }, [getKeyValue, onItemTypeEdit, onQuantityDecrement, onQuantityIncrement, onStockDelete]);
};

export default useStockTableValue;