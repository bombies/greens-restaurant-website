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
    onItemTypeEdit?: (itemUID: string, newType: StockType) => Promise<void>,
    showItemTypeEditAction?: boolean,
}

const useStockTableValue = ({
    getKeyValue,
    mutationAllowed,
    onQuantityDecrement,
    onQuantityIncrement,
    onStockDelete,
    onItemTypeEdit,
    showItemTypeEditAction
}: Props) => {

    return useCallback((item: StockSnapshot, key: Key) => {
        switch (key) {
            case "stock_actions": {
                return (
                    mutationAllowed ? (
                        <StockTableActions
                            item={item}
                            onQuantityDecrement={onQuantityDecrement}
                            onQuantityIncrement={onQuantityIncrement}
                            onStockDelete={onStockDelete}
                            onItemTypeEdit={onItemTypeEdit}
                            showItemTypeEditAction={showItemTypeEditAction}
                        />
                    ) : (<></>)
                );
            }
            default: {
                return getKeyValue(item, key as StockTableColumnKey);
            }
        }
    }, [getKeyValue, mutationAllowed, onItemTypeEdit, onQuantityDecrement, onQuantityIncrement, onStockDelete, showItemTypeEditAction]);
};

export default useStockTableValue;