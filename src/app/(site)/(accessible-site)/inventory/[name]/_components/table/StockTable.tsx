"use client";

import { Prisma, StockSnapshot } from "@prisma/client";
import {
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow
} from "@nextui-org/react";
import addIcon from "/public/icons/add-2.svg";
import minusIcon from "/public/icons/minus.svg";
import moreIcon from "/public/icons/more.svg";
import IconButton from "../../../../../../_components/inputs/IconButton";
import StockOptionsDropdown from "./StockOptionsDropdown";
import AddStockModal from "./AddStockModal";
import { useCallback, useState } from "react";
import ConfirmationModal from "../../../../../../_components/ConfirmationModal";
import RemoveStockModal from "./RemoveStockModal";
import StockQuantityField from "./StockQuantityField";

type Props = {
    stock?: StockSnapshot[],
}

type Column = {
    key: string,
    value: string,
}


const columns: Column[] = [
    {
        key: "stock_name",
        value: "Name"
    },
    {
        key: "stock_quantity",
        value: "Quantity"
    },
    {
        key: "stock_actions",
        value: "Actions"
    }
];

export default function StockTable({ stock }: Props) {
    const [addStockModalOpen, setAddStockModalOpen] = useState(false);
    const [removeStockModalOpen, setRemoveStockModalOpen] = useState(false);
    const [deleteStockModalOpen, setDeleteStockModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<StockSnapshot>();

    const getKeyValue = useCallback((item: StockSnapshot, key: Prisma.Key) => {
        if (key === "stock_name")
            return item.name;
        if (key === "stock_quantity")
            return <StockQuantityField stock={item} />;
        if (key === "stock_actions")
            return (
                <div className="flex gap-3">
                    <div className="flex gap-8 p-3 default-container !rounded-xl w-fit">
                        <IconButton icon={addIcon} toolTip="Increment" />
                        <IconButton icon={minusIcon} toolTip="Decrement" />
                    </div>
                    <div className="flex  p-3 default-container !rounded-xl w-fit">
                        <IconButton
                            icon={moreIcon}
                            toolTip="More Options"
                            withDropdown={
                                <StockOptionsDropdown
                                    onAdd={() => {
                                        setSelectedItem(item);
                                        setAddStockModalOpen(true);
                                    }}
                                    onRemove={() => {
                                        setSelectedItem(item);
                                        setRemoveStockModalOpen(true);
                                    }}
                                    onDelete={() => {
                                        setSelectedItem(item);
                                        setDeleteStockModalOpen(true);
                                    }}
                                />
                            }
                        />
                    </div>
                </div>
            );
        return undefined;
    }, []);

    return (
        <>
            {/*<div>*/}
            {/*    {JSON.stringify(stock)}*/}
            {/*</div>*/}
            <AddStockModal
                isOpen={addStockModalOpen}
                setOpen={setAddStockModalOpen}
                onClose={() => setSelectedItem(undefined)}
                item={selectedItem}
            />
            <RemoveStockModal
                isOpen={removeStockModalOpen}
                setOpen={setRemoveStockModalOpen}
                onClose={() => setSelectedItem(undefined)}
                item={selectedItem}
            />
            <ConfirmationModal
                isOpen={deleteStockModalOpen}
                setOpen={setDeleteStockModalOpen}
                title={`Delete ${selectedItem?.name}`}
                message={
                    `Are you sure you want to delete ${selectedItem?.name
                        ?.replace(
                            /(\w)(\w*)/g,
                            (g0, g1, g2) => g1.toUpperCase() + g2.toLowerCase()
                        )
                    }?`
                }
                onAccept={() => {
                    setDeleteStockModalOpen(false);
                }}
            />
            <Table
                isStriped={true}
                className="!bg-secondary/20"
                aria-label="Stock Table"
            >
                <TableHeader columns={columns}>
                    {column => <TableColumn key={column.key}>{column.value}</TableColumn>}
                </TableHeader>
                <TableBody items={stock}>
                    {item => (
                        <TableRow key={item.uid}>
                            {columnKey => <TableCell className="capitalize">{getKeyValue(item, columnKey)}</TableCell>}
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </>
    );
}