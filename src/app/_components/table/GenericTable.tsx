"use client";

import { Table, TableBody, TableColumn, TableHeader, TableProps } from "@nextui-org/react";
import clsx from "clsx";
import { Column } from "../../(site)/(accessible-site)/invoices/[id]/[invoiceId]/components/table/InvoiceTable";
import { RowElement } from "@react-types/table";
import { JSX } from "react";

interface Props<T> extends Omit<TableProps, "children"> {
    columns: Column[],
    children: RowElement<T> | RowElement<T>[] | ((item: T) => RowElement<T>),
    items: T[],
    sortableColumns?: string[],
    emptyContent?: string,
    isLoading?: boolean,
    loadingContent?: JSX.Element
}

export default function GenericTable<T>({
                                            columns,
                                            items,
                                            sortableColumns,
                                            emptyContent,
                                            children,
                                            loadingContent,
                                            isLoading,
                                            ...tableProps
                                        }: Props<T>) {
    return (
        <Table
            {...tableProps}
            color={tableProps.color ?? "primary"}
            classNames={{
                ...tableProps.classNames,
                wrapper: clsx("!bg-secondary/20 rounded-2xl", tableProps.classNames?.wrapper),
                th: clsx("bg-neutral-950/50 backdrop-blur-md text-white uppercase", tableProps.classNames?.th)
            }}
        >
            <TableHeader columns={columns}>
                {(column: Column) =>
                    <TableColumn
                        key={column.key}
                        allowsSorting={sortableColumns?.includes(column.key)}>
                        {column.value}
                    </TableColumn>}
            </TableHeader>
            <TableBody
                items={items}
                emptyContent={emptyContent}
                isLoading={isLoading}
                loadingContent={loadingContent}
            >
                {children}
            </TableBody>
        </Table>
    );
};