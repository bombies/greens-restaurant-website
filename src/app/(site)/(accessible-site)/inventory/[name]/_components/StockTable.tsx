"use client";

import { Prisma, StockSnapshot } from "@prisma/client";
import { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@nextui-org/react";
import addIcon from "/public/icons/add-2.svg";
import minusIcon from "/public/icons/minus.svg";
import moreIcon from "/public/icons/more.svg";
import IconButton from "../../../../../_components/inputs/IconButton";

type Props = {
    stock?: StockSnapshot[],
}

type Column = {
    key: string,
    value: string,
}

const getKeyValue = (item: StockSnapshot, key: Prisma.Key) => {
    if (key === "stock_name")
        return item.name;
    if (key === "stock_quantity")
        return item.quantity;
    if (key === "stock_actions")
        return (
            <div className='flex gap-3'>
                <div className="flex gap-8 p-3 default-container !rounded-xl w-fit">
                    <IconButton icon={addIcon} toolTip="Increment" />
                    <IconButton icon={minusIcon} toolTip="Decrement" />
                </div>
                <div className="flex  p-3 default-container !rounded-xl w-fit">
                    <IconButton icon={moreIcon} toolTip="More Options" />
                </div>
            </div>
        );
    return undefined;
};

export default function StockTable({ stock }: Props) {
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

    return (
        // <div>
        //     {JSON.stringify(stock)}
        // </div>
        <Table
            isStriped={true}
            className='!bg-secondary/20'
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
    );
}