"use client";

import { Key, useCallback, useMemo } from "react";
import { Column } from "../../../../invoices/[id]/[invoiceId]/components/table/InvoiceTable";
import { StockSnapshot } from "@prisma/client";
import { InventorySectionSnapshotWithOptionalExtras } from "../../../../../../api/inventory/bar/[name]/types";
import { dollarFormat } from "../../../../../../../utils/GeneralUtils";
import "../../../../../../../utils/GeneralUtils";

type Props = {
    currentSnapshot?: InventorySectionSnapshotWithOptionalExtras,
    previousSnapshot: InventorySectionSnapshotWithOptionalExtras
}

const useChecksAndBalancesTableParams = ({ previousSnapshot, currentSnapshot }: Props) => {
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
            key: "sale_quantity",
            value: "Quantity Sold"
        },
        {
            key: "stock_sale",
            value: "Sale of Stock"
        }
    ], []);

    const getKeyValue = useCallback((item: StockSnapshot, key: Key) => {
        const correspondingItem = previousSnapshot.stockSnapshots?.find(prevItem => prevItem?.uid === item.uid);

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
                return correspondingItem ? Math.abs(correspondingItem.quantity - item.quantity) : "N/A";
            }
            case "stock_sale": {
                return correspondingItem ? dollarFormat.format(Math.abs(correspondingItem.quantity - item.quantity) * item.price) : "N/A";
            }
        }
    }, [previousSnapshot.stockSnapshots]);

    const sortedItems = useMemo(() => (
        currentSnapshot?.stockSnapshots ?? []
    ), [currentSnapshot?.stockSnapshots]);

    return { columns, getKeyValue, items: sortedItems };
};

export default useChecksAndBalancesTableParams;