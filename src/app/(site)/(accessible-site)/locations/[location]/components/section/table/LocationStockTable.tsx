"use client";

import { FC, Fragment, useState } from "react";
import GenericStockTable, {
    StockTableColumnKey
} from "../../../../../inventory/[name]/_components/table/generic/GenericStockTable";
import useSWR, { KeyedMutator } from "swr";
import { InventorySection, RequestedStockItem, Stock, StockSnapshot } from "@prisma/client";
import AddLocationSectionStockItemModal from "../AddLocationSectionStockItemModal";
import { toast } from "react-hot-toast";
import "../../../../../../../../utils/GeneralUtils";
import useLocationStockOptimisticUpdates from "./hooks/useLocationStockOptimisticUpdates";
import StockNumericField from "../../../../../inventory/[name]/_components/table/generic/StockNumericField";
import { InventorySectionSnapshotWithOptionalExtras } from "../../../../../../../api/inventory/location/[name]/types";
import { fetcher } from "../../../../../employees/_components/EmployeeGrid";

type Props = {
    locationName?: string,
    section?: InventorySection
    currentSnapshot?: InventorySectionSnapshotWithOptionalExtras
    mutateCurrentSnapshot?: KeyedMutator<InventorySectionSnapshotWithOptionalExtras | undefined>
    stockIsLoading: boolean,
    mutationAllowed: boolean,
    requestedItems: RequestedStockItem[],
}

export type PartialStockSnapshotWithStock = Partial<Omit<StockSnapshot, "id">>

const useAllStock = () => (
    useSWR("/api/inventory/stock", fetcher<Stock[]>)
);

const LocationStockTable: FC<Props> = ({
                                           locationName,
                                           section,
                                           currentSnapshot,
                                           mutateCurrentSnapshot,
                                           stockIsLoading,
                                           mutationAllowed,
                                           requestedItems
                                       }) => {

    const [addItemModelOpen, setAddItemModalOpen] = useState(false);
    const { data: allStock, isLoading: allStocksLoading } = useAllStock();
    const {
        addOptimisticStockItem,
        removeOptimisticStockItems,
        updateOptimisticStockSnapshot
    } = useLocationStockOptimisticUpdates({ locationName, section, currentSnapshot, mutateCurrentSnapshot });

    return (
        <Fragment>
            <AddLocationSectionStockItemModal
                locationName={locationName}
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
                showGoodsReceived
                getKeyValue={(item, key) => {
                    const correspondingStock = allStock?.find(stock => stock.uid === item.uid);
                    const requestedStockItems = requestedItems.filter(reqItem => reqItem.stockId === correspondingStock?.id);
                    const goodsReceived = requestedStockItems.reduce((acc, next) => acc + (next.amountProvided ?? 0), 0);

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
                        case StockTableColumnKey.GOODS_PROVIDED: {
                            return goodsReceived;
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

export default LocationStockTable;