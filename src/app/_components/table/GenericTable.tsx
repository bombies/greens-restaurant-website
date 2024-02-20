"use client";

import { Table, TableBody, TableColumn, TableHeader, TableProps } from "@nextui-org/react";
import clsx from "clsx";
import { Column } from "../../(site)/(accessible-site)/invoices/[id]/[invoiceId]/components/table/InvoiceTable";
import { RowElement } from "@react-types/table";
import { JSX } from "react";
import GenericButton from "../inputs/GenericButton";
import { LoaderIcon } from "lucide-react";
import useLazyChunkedItems from "../hooks/useLazyChunkedItems";

interface Props<T> extends Omit<TableProps, "children"> {
    columns: Column[],
    children: RowElement<T> | RowElement<T>[] | ((item: T) => (RowElement<T>)),
    items: T[],
    sortableColumns?: string[],
    emptyContent?: string,
    isLoading?: boolean,
    loadingContent?: JSX.Element
    maxItems?: number
}

export default function GenericTable<T>({
    columns,
    items,
    sortableColumns,
    emptyContent,
    children,
    loadingContent,
    isLoading,
    maxItems,
    ...tableProps
}: Props<T>) {
    const { loadedItems, hasMoreToLoad } = useLazyChunkedItems(items, maxItems)

    // const [loaderRef, scrollerRef] = useInfiniteScroll({
    //     hasMore: hasMoreToLoad,
    //     onLoadMore: loadedItems.loadMore
    // })

    return (
        <Table
            {...tableProps}
            // baseRef={maxItems ? scrollerRef : tableProps.baseRef}
            bottomContent={maxItems && hasMoreToLoad ?
                (
                    <div className="flex w-full justify-center">
                        <GenericButton
                            startContent={<LoaderIcon width={16} />}
                            onPress={loadedItems.loadMore}
                            variant="flat"
                        >Load More</GenericButton>
                    </div>
                )
                : tableProps.bottomContent
            }
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
                        allowsSorting={sortableColumns?.includes(column.key)}
                    >
                        {column.value}
                    </TableColumn>}
            </TableHeader>
            <TableBody
                items={maxItems ? loadedItems.items : items}
                emptyContent={emptyContent}
                isLoading={isLoading}
                loadingContent={loadingContent}
            >
                {children}
            </TableBody>
        </Table>
    );
};