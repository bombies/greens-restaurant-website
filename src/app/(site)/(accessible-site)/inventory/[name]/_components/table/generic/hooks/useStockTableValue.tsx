"use client";

import { StockTableColumnKey } from "../GenericStockTable";
import { Key, useCallback } from "react";
import IconButton from "../../../../../../../../_components/inputs/IconButton";
import StockOptionsDropdown from "../StockOptionsDropdown";
import { StockSnapshotWithStock } from "../../../../../../../../api/inventory/[name]/utils";

const useStockTableValue = (getKeyValue: (item: StockSnapshotWithStock, key: StockTableColumnKey) => any, mutationAllowed: boolean) => {
    return useCallback((item: StockSnapshotWithStock, key: Key) => {
        switch (key) {
            case "stock_actions": {
                return (
                    <div className="flex gap-3">
                        <div className="flex gap-8 p-3 default-container !rounded-xl w-fit">
                            <IconButton
                                disabled={!mutationAllowed}
                                toolTip="Increment"
                                cooldown={1}
                                onPress={() => {
                                    // TODO: Work on increment logic
                                }}
                            />
                            <IconButton
                                disabled={!mutationAllowed}
                                toolTip="Decrement"
                                cooldown={1}
                                onPress={() => {
                                    // TODO: Work on decrement logic
                                }}
                            />
                        </div>
                        <div className="flex  p-3 default-container !rounded-xl w-fit">
                            <IconButton
                                disabled={!mutationAllowed}
                                toolTip="More Options"

                                // TODO: Replace with with a popover with a form
                                // Doing so negates the need for a "selectedItem" state.
                                withDropdown={
                                    <StockOptionsDropdown
                                        onAdd={() => {
                                            // TODO: Work on custom add logic
                                        }}
                                        onRemove={() => {
                                            // TODO: Work on custom remove logic
                                        }}
                                        onDelete={() => {
                                            // TODO: Work on custom delete logic
                                        }}
                                    />
                                }
                            />
                        </div>
                    </div>
                );
            }
            default: {
                return getKeyValue(item, key as StockTableColumnKey);
            }
        }
    }, [getKeyValue, mutationAllowed]);
};

export default useStockTableValue;