"use client";

import { FC, Fragment, useState } from "react";
import GenericStockTable, {
    StockTableColumnKey
} from "../../../../inventory/[name]/_components/table/generic/GenericStockTable";
import useSWR, { KeyedMutator } from "swr";
import { InventorySection, Stock, StockSnapshot } from "@prisma/client";
import AddBarSectionStockItemModal from "../AddBarSectionStockItemModal";
import { toast } from "react-hot-toast";
import "../../../../../../../utils/GeneralUtils";
import useBarStockOptimisticUpdates from "./hooks/useBarStockOptimisticUpdates";
import StockNumericField from "../../../../inventory/[name]/_components/table/generic/StockNumericField";
import { InventorySectionSnapshotWithOptionalExtras } from "../../../../../../api/inventory/bar/[name]/types";
import { fetcher } from "../../../../employees/_components/EmployeeGrid";

type Props = {
    barName?: string,
    section?: InventorySection
    currentSnapshot?: InventorySectionSnapshotWithOptionalExtras
    mutateCurrentSnapshot?: KeyedMutator<InventorySectionSnapshotWithOptionalExtras | undefined>
    stockIsLoading: boolean,
    mutationAllowed: boolean,
}

export type PartialStockSnapshotWithStock = Partial<Omit<StockSnapshot, "id">>

const useAllStock = () => (
    useSWR("/api/inventory/stock", fetcher<Stock[]>)
);

const BarStockTable: FC<Props> = ({
                                      barName,
                                      section,
                                      currentSnapshot,
                                      mutateCurrentSnapshot,
                                      stockIsLoading,
                                      mutationAllowed
                                  }) => {

    const [addItemModelOpen, setAddItemModalOpen] = useState(false);
    const { data: allStock, isLoading: allStocksLoading } = useAllStock();
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
                isOpen={addItemModelOpen && mutationAllowed}
                setOpen={setAddItemModalOpen}
                addOptimisticStockItem={addOptimisticStockItem}
                items={allStock ?? []}
            />
            <GenericStockTable
                stock={currentSnapshot?.stockSnapshots ?? []}
                stockLoading={stockIsLoading}
                mutationAllowed={mutationAllowed && !allStocksLoading}
                getKeyValue={(item, key) => {
                    const correspondingStock = allStock?.find(stock => stock.uid === item.uid);
                    switch (key) {
                        case StockTableColumnKey.STOCK_NAME: {
                            return correspondingStock ? correspondingStock.name.capitalize().replaceAll("-", " ") : item.name.capitalize().replaceAll("-", " ");
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
                                    stockSnapshot={item}
                                    disabled={!mutationAllowed}
                                    onSet={async (quantity) => {
                                        await updateOptimisticStockSnapshot({ uid: item.uid, sellingPrice: quantity });
                                    }}
                                    currency="selling"
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
};

export default BarStockTable;