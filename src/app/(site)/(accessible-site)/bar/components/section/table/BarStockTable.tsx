"use client";

import { FC, Fragment, useState } from "react";
import GenericStockTable, {
    StockTableColumnKey
} from "../../../../inventory/[name]/_components/table/generic/GenericStockTable";
import { KeyedMutator } from "swr";
import { InventorySection, StockSnapshot } from "@prisma/client";
import AddBarSectionStockItemModal from "../AddBarSectionStockItemModal";
import { toast } from "react-hot-toast";
import "../../../../../../../utils/GeneralUtils";
import useBarStockOptimisticUpdates from "./hooks/useBarStockOptimisticUpdates";
import StockNumericField from "../../../../inventory/[name]/_components/table/generic/StockNumericField";
import { InventorySectionSnapshotWithExtras } from "../../../../../../api/inventory/[name]/types";
import StockTextField from "../../../../inventory/[name]/_components/table/generic/StockTextField";

type Props = {
    barName?: string,
    section?: InventorySection
    currentSnapshot?: InventorySectionSnapshotWithExtras
    mutateCurrentSnapshot: KeyedMutator<InventorySectionSnapshotWithExtras | undefined>
    stockIsLoading: boolean,
    mutationAllowed: boolean,
}

export type PartialStockSnapshotWithStock = Partial<Omit<StockSnapshot, "id">>

const BarStockTable: FC<Props> = ({
                                      barName,
                                      section,
                                      currentSnapshot,
                                      mutateCurrentSnapshot,
                                      stockIsLoading,
                                      mutationAllowed
                                  }) => {

    const [addItemModelOpen, setAddItemModalOpen] = useState(false);
    const {
        addOptimisticStockItem,
        removeOptimisticStockItems,
        updateOptimisticStockSnapshot
    } = useBarStockOptimisticUpdates({ barName, section, currentSnapshot, mutateCurrentSnapshot });

    return (
        <Fragment>
            <AddBarSectionStockItemModal
                barName={barName}
                sectionSnapshot={currentSnapshot}
                isOpen={addItemModelOpen}
                setOpen={setAddItemModalOpen}
                addOptimisticStockItem={addOptimisticStockItem}
            />
            <GenericStockTable
                stock={currentSnapshot?.stockSnapshots ?? []}
                stockLoading={stockIsLoading}
                mutationAllowed={mutationAllowed}
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
                                    isCurrency
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
            />
        </Fragment>
    );
};

export default BarStockTable;