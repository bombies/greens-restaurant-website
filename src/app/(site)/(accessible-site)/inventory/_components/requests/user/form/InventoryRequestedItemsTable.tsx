import { FC, Key } from "react";
import GenericTable from "../../../../../../../_components/table/GenericTable";
import { TableCell, TableRow } from "@nextui-org/react";
import { Column } from "../../../../../invoices/[id]/[invoiceId]/components/table/InvoiceTable";
import {
    RequestedStockItemWithOptionalSnapshot,
    RequestedStockItemWithOptionalSnapshotAndRequest
} from "../../inventory-requests-utils";

const columns: Column[] = [
    { key: "item_name", value: "Item Name" },
    { key: "amount_requested", value: "Amount Requested" }
];

interface Props {
    items: RequestedStockItemWithOptionalSnapshot[];
}

const getValueForKey = (item: RequestedStockItemWithOptionalSnapshotAndRequest, key: Key) => {
    switch (key) {
        case "item_name": {
            return <p className="capitalize">{item.stockSnapshot?.name.replaceAll("-", " ")}</p>;
        }
        case "amount_requested": {
            return item.amountRequested;
        }
    }
};

const InventoryRequestedItemsTable: FC<Props> = ({ items }) => {
    return (
        <GenericTable
            columns={columns}
            items={items}
            emptyContent="Select an inventory then click on the button below to start requesting items."
        >
            {(item) => (
                <TableRow key={item.id}>
                    {(colKey) => (
                        <TableCell>{getValueForKey(item, colKey)}</TableCell>
                    )}
                </TableRow>
            )}
        </GenericTable>
    );
};

export default InventoryRequestedItemsTable;