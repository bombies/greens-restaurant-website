"use client";

import { Key, useCallback, useMemo } from "react";
import { Column } from "../../../../../invoices/[id]/[invoiceId]/components/table/InvoiceTable";
import { RequestedStockItem, StockSnapshot } from "@prisma/client";
import { InventorySectionSnapshotWithOptionalExtras } from "../../../../../../../api/inventory/location/[name]/types";
import { dollarFormat } from "../../../../../../../../utils/GeneralUtils";
import "../../../../../../../../utils/GeneralUtils";

type Props = {
    currentSnapshot?: InventorySectionSnapshotWithOptionalExtras,
    previousSnapshot: InventorySectionSnapshotWithOptionalExtras,
    requestedStockItems: RequestedStockItem[]
}

const useChecksAndBalancesTableParams = ({ previousSnapshot, currentSnapshot, requestedStockItems }: Props) => {
    const columns: Column[] = useMemo(() => [
        {
            key: "item_name",
            value: "Item Name"
        },
        {
            key: "closing_quantity",
            value: "Closing Quantity"
        },
        {
            key: "opening_quantity",
            value: "Opening Quantity"
        },
        {
            key: "goods_received",
            value: "Goods Received"
        },
        {
            key: "sale_quantity",
            value: "Quantity Sold"
        },
        {
            key: "stock_sale",
            value: "Sale of Stock"
        }
    ], []);

    const getKeyValue = useCallback((item: StockSnapshot, key: Key) => {
        const correspondingItem = previousSnapshot.stockSnapshots?.find(prevItem => prevItem?.name === item.name);
        const requestedItems = requestedStockItems.filter(reqItem => reqItem.stockUID === correspondingItem?.uid);
        const goodsReceived = requestedItems.reduce((acc, next) => acc + (next.amountProvided ?? 0), 0);
        const saleOfGoods = ((correspondingItem?.quantity ?? 0) + goodsReceived) - item.quantity;

        switch (key) {
            case "item_name": {
                return item.name.capitalize().replaceAll("-", " ");
            }
            case "closing_quantity": {
                return item.quantity;
            }
            case "opening_quantity": {
                return correspondingItem?.quantity ?? "N/A";
            }
            case "sale_quantity": {
                return correspondingItem ? saleOfGoods : "N/A";
            }
            case "stock_sale": {
                return correspondingItem ? dollarFormat.format(saleOfGoods * item.price) : "N/A";
            }
            case "goods_received": {
                return goodsReceived;
            }
        }
    }, [previousSnapshot.stockSnapshots, requestedStockItems]);

    const sortedItems = useMemo(() => (
        currentSnapshot?.stockSnapshots ?? []
    ), [currentSnapshot?.stockSnapshots]);

    return { columns, getKeyValue, items: sortedItems };
};

export default useChecksAndBalancesTableParams;