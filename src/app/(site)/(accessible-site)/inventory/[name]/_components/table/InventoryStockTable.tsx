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
import { Column } from "@/app/(site)/(accessible-site)/invoices/[id]/[invoiceId]/components/table/InvoiceTable";
import { AsyncMutator, OptimisticMutator } from "@/app/hooks/useOptimistic";

type DefaultProps = {
    inventoryName: string,
    currentSnapshot?: InventorySnapshotWithExtras,
    snapshotLoading?: boolean,
    mutationAllowed?: boolean
}

type Props = ({
    type?: "client-data"
    mutateCurrentSnapshot: KeyedMutator<InventorySnapshotWithExtras | undefined>,
} | {
    type: "server-data",
    mutateCurrentSnapshot: OptimisticMutator<InventorySnapshotWithExtras>,
} | {
    type: "read-only",
    mutateCurrentSnapshot?: undefined,
}) & DefaultProps


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
    type,
    inventoryName,
    currentSnapshot,
    snapshotLoading = false,
    mutateCurrentSnapshot,
    mutationAllowed
}: Props) {
    const {
        addOptimisticStockItem,
        updateOptimisticStockSnapshot,
        removeOptimisticStockItems
        // @ts-ignore
    } = useInventoryStockOptimisticUpdates({ type, inventoryName, currentSnapshot, mutateCurrentSnapshot });
    const [addItemModalOpen, setAddItemModalOpen] = useState(false);

    return (
        <Fragment>
            {
                mutationAllowed && (
                    <AddStockItemModal
                        inventoryName={inventoryName}
                        inventorySnapshot={currentSnapshot}
                        isOpen={addItemModalOpen}
                        setOpen={setAddItemModalOpen}
                        addOptimisticStockItem={addOptimisticStockItem}
                    />
                )
            }
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
                                    disabled={!mutationAllowed}
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
                                    disabled={!mutationAllowed}
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
                                    disabled={!mutationAllowed}
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
                showItemTypeEditAction
                onItemTypeEdit={async (itemUID, newType) => {
                    await updateOptimisticStockSnapshot({ uid: itemUID, type: newType });
                }}
            />
        </Fragment>
    );
}