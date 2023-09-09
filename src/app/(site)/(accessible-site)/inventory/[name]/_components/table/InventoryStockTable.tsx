"use client";

import { Fragment, useState } from "react";
import StockNumericField from "./generic/StockNumericField";
import "../../../../../../../utils/GeneralUtils";
import { toast } from "react-hot-toast";
import { KeyedMutator } from "swr";
import useInventoryStockOptimisticUpdates from "./hooks/useInventoryStockOptimisticUpdates";
import GenericStockTable, { StockTableColumnKey } from "./generic/GenericStockTable";
import AddStockItemModal from "./generic/AddStockItemModal";
import { InventorySnapshotWithExtras } from "../../../../../../api/inventory/[name]/types";
import StockTextField from "./generic/StockTextField";

type Props = {
    inventoryName: string,
    currentSnapshot?: InventorySnapshotWithExtras,
    snapshotLoading: boolean,
    mutateCurrentSnapshot: KeyedMutator<InventorySnapshotWithExtras | undefined>,
    mutationAllowed?: boolean
}

type Column = {
    key: string,
    value: string,
}


export const columns: Column[] = [
    {
        key: "stock_name",
        value: "Name"
    },
    {
        key: "stock_quantity",
        value: "Quantity"
    },
    {
        key: "stock_price",
        value: "Cost"
    }
];

export default function InventoryStockTable({
                                                inventoryName,
                                                currentSnapshot,
                                                snapshotLoading,
                                                mutateCurrentSnapshot,
                                                mutationAllowed
                                            }: Props) {
    const {
        addOptimisticStockItem,
        updateOptimisticStockSnapshot,
        removeOptimisticStockItems
    } = useInventoryStockOptimisticUpdates({ inventoryName, currentSnapshot, mutateCurrentSnapshot });
    const [addItemModalOpen, setAddItemModalOpen] = useState(false);

    return (
        <Fragment>
            <AddStockItemModal
                inventoryName={inventoryName}
                inventorySnapshot={currentSnapshot}
                isOpen={addItemModalOpen}
                setOpen={setAddItemModalOpen}
                addOptimisticStockItem={addOptimisticStockItem}
            />
            <GenericStockTable
                stock={currentSnapshot?.stockSnapshots ?? []}
                stockLoading={snapshotLoading}
                mutationAllowed={mutationAllowed ?? false}
                priceIsCost
                getKeyValue={(item, key) => {
                    switch (key) {
                        case StockTableColumnKey.STOCK_NAME: {
                            return (
                                <StockTextField
                                    stockSnapshot={item}
                                    field="name"
                                    onSet={async (text) => {
                                        await updateOptimisticStockSnapshot({ uid: item.uid, name: text });
                                    }}
                                />
                            );
                        }
                        case StockTableColumnKey.STOCK_QUANTITY: {
                            return (
                                <StockNumericField
                                    stockSnapshot={item}
                                    onSet={async (quantity) => {
                                        await updateOptimisticStockSnapshot(item, quantity);
                                    }}
                                />
                            );
                        }
                        case StockTableColumnKey.STOCK_PRICE: {
                            return (
                                <StockNumericField
                                    stockSnapshot={item}
                                    onSet={async (quantity) => {
                                        await updateOptimisticStockSnapshot({ uid: item.uid, price: quantity });
                                    }}
                                    currency="cost"
                                />
                            );
                        }
                    }
                }}
                onQuantityIncrement={async (item, incrementedBy) => {
                    await updateOptimisticStockSnapshot(item, item.quantity + incrementedBy);
                }}
                onQuantityDecrement={async (item, decrementedBy) => {
                    const newQuantity = item.quantity - decrementedBy;
                    if (newQuantity < 0) {
                        toast.error(`You can't decrement ${item.name.replaceAll("-", " ").capitalize()} ${decrementedBy === 1 ? "anymore" : `by ${decrementedBy}`}!`);
                        return;
                    }
                    await updateOptimisticStockSnapshot(item, newQuantity);
                }}
                onStockDelete={async (uids) => {
                    await removeOptimisticStockItems(uids);
                }}
                onItemAddButtonPress={() => {
                    setAddItemModalOpen(true);
                }}
                onItemTypeEdit={async (itemUID, newType) => {
                    await updateOptimisticStockSnapshot({ uid: itemUID, type: newType });
                }}
            />
        </Fragment>
    );
}