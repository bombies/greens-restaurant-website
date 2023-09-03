"use client";

import { FC, Fragment, useMemo } from "react";
import { Column } from "../../../../../invoices/[id]/[invoiceId]/components/table/InvoiceTable";
import useStockTableValue from "./hooks/useStockTableValue";
import useStockTableState from "./hooks/useStockTableState";
import GenericTable from "../../../../../../../_components/table/GenericTable";
import { Spacer, TableCell, TableRow } from "@nextui-org/react";
import GenericInput from "../../../../../../../_components/inputs/GenericInput";
import AddInventoryItemButton from "../AddInventoryItemButton";
import SearchIcon from "../../../../../../../_components/icons/SearchIcon";
import { StockSnapshot } from "@prisma/client";

interface Props {
    stock: StockSnapshot[];
    stockLoading: boolean,
    mutationAllowed: boolean;
    getKeyValue: (item: StockSnapshot, key: StockTableColumnKey) => any;
    onQuantityIncrement: (item: StockSnapshot, incrementedBy: number) => Promise<void>;
    onQuantityDecrement: (item: StockSnapshot, decrementedBy: number) => Promise<void>;
    onStockDelete: (deletedIds: string[]) => Promise<void>;
    onItemAddButtonPress: () => void,
}

export enum StockTableColumnKey {
    STOCK_NAME = "stock_name",
    STOCK_QUANTITY = "stock_quantity",
}


const GenericStockTable: FC<Props> = ({
                                          stock,
                                          stockLoading,
                                          mutationAllowed,
                                          getKeyValue,
                                          onQuantityIncrement,
                                          onQuantityDecrement,
                                          onStockDelete,
                                          onItemAddButtonPress
                                      }) => {
    const fetchKeyValue = useStockTableValue({
        getKeyValue, mutationAllowed, onQuantityDecrement, onQuantityIncrement, onStockDelete
    });

    const columns: Column[] = useMemo(() => {
        const cols: Column[] = [
            {
                key: "stock_name",
                value: "Name"
            },
            {
                key: "stock_quantity",
                value: "Quantity"
            }
        ];

        if (mutationAllowed)
            cols.push({
                key: "stock_actions",
                value: "Actions"
            });
        return cols;
    }, [mutationAllowed]);

    const {
        stockState,
        stockSearch,
        sortDescriptor,
        visibleStockState,
        setStockSearch,
        setSortDescriptor
    } = useStockTableState(stock);

    return (
        <Fragment>
            <div className="w-1/4 tablet:w-1/2 phone:w-full">
                <GenericInput
                    startContent={<SearchIcon />}
                    id="stock_search"
                    label="Search for an item"
                    placeholder="Search..."
                    value={stockSearch}
                    onValueChange={(value: string | undefined) => setStockSearch(value)}
                />
            </div>
            <Spacer y={6} />
            <GenericTable
                columns={columns}
                items={visibleStockState}
                sortableColumns={["stock_name", "stock_quantity"]}
                emptyContent="There are no items..."
                isLoading={stockLoading}
                aria-label="Inventory Stock Table"
                sortDescriptor={sortDescriptor}
                onSortChange={setSortDescriptor}
            >
                {item => (
                    <TableRow key={item.uid}>
                        {key => (
                            <TableCell className="capitalize">{fetchKeyValue(item, key)}</TableCell>
                        )}
                    </TableRow>
                )}
            </GenericTable>
            <Spacer y={6} />
            <AddInventoryItemButton onPress={onItemAddButtonPress} />
        </Fragment>
    );
};

export default GenericStockTable;