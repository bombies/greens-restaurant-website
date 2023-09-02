"use client";

import { StockSnapshot } from "@prisma/client";
import { useEffect, useMemo, useReducer, useState } from "react";
import { SortDescriptor } from "@nextui-org/react";
import { StockSnapshotWithStock } from "../../../../../../../../api/inventory/[name]/utils";

enum StockAction {
    UPDATE,
    DELETE,
    SET
}

const reducer = (state: StockSnapshotWithStock[], action: {
    type: StockAction,
    payload: Partial<StockSnapshot> | StockSnapshot[]
}) => {
    let newState = [...state];

    switch (action.type) {
        case StockAction.UPDATE: {
            if (typeof action.payload !== "object")
                throw new Error("The payload must be an object when the action type is StockAction.UPDATE");

            const index = state.findIndex(item => item.uid === (action.payload as Partial<StockSnapshot>).uid);
            newState[index] = {
                ...newState[index],
                ...action.payload
            };
            break;
        }
        case StockAction.DELETE: {

            if (typeof action.payload !== "object")
                throw new Error("The payload must be an object when the action type is StockAction.DELETE");

            const index = state.findIndex(item => item.uid === (action.payload as Partial<StockSnapshot>).uid);
            newState.splice(index);
            break;
        }
        case StockAction.SET: {
            newState = action.payload as StockSnapshotWithStock[];
            break;
        }
        default: {
            newState = state;
        }
    }

    return newState;
};

const useStockTableState = (stock: StockSnapshotWithStock[]) => {
    const [stockState, dispatchStockState] = useReducer(reducer, stock ?? []);
    const [visibleStockState, setVisibleStockState] = useState<StockSnapshotWithStock[]>(stockState);
    const [stockSearch, setStockSearch] = useState<string>();
    const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>();

    useEffect(() => {
        if (!stock)
            return;

        dispatchStockState({
            type: StockAction.SET,
            payload: stock
        });
    }, [stock]);

    useEffect(() => {
        if (!stockSearch) {
            setVisibleStockState(stockState);
            return;
        }

        setVisibleStockState(
            stockState.filter(stockSnapshot =>
                stockSnapshot.stock.name
                    .toLowerCase()
                    .includes(stockSearch.toLowerCase().trim())
            )
        );
    }, [stockSearch, stockState]);

    const sortedItems = useMemo(() => {
        return visibleStockState.sort((a, b) => {
            if (!sortDescriptor)
                return 0;
            let cmp: number;

            switch (sortDescriptor.column) {
                case "stock_name": {
                    cmp = a.stock.name.localeCompare(b.stock.name);
                    break;
                }
                case "stock_quantity": {
                    cmp = a.quantity < b.quantity ? -1 : 1;
                    break;
                }
                default: {
                    cmp = 0;
                    break;
                }
            }

            if (sortDescriptor.direction === "descending") {
                cmp *= -1;
            }

            return cmp;
        });
    }, [sortDescriptor, visibleStockState]);

    return {
        stockState,
        visibleStockState: sortedItems,
        stockSearch,
        setStockSearch,
        sortDescriptor,
        setSortDescriptor
    };
};

export default useStockTableState;