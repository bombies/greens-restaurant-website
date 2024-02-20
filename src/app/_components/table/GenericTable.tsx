"use client";

import { Spinner, Table, TableBody, TableColumn, TableHeader, TableProps } from "@nextui-org/react";
import clsx from "clsx";
import { Column } from "../../(site)/(accessible-site)/invoices/[id]/[invoiceId]/components/table/InvoiceTable";
import { RowElement } from "@react-types/table";
import { JSX, useMemo, useState } from "react";
import { useAsyncList } from "@react-stately/data";
import { chunk } from "@/utils/GeneralUtils";
import GenericButton from "../inputs/GenericButton";
import { LoaderIcon } from "lucide-react";

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
    const [hasMoreToLoad, setHasMoreToLoad] = useState(false);
    const startingChunkIndex = useMemo(() => 0, [])
    const chunkedData = useMemo(() => maxItems ? chunk(items, maxItems) : [items], [items, maxItems])

    let loadedItems = useAsyncList<T>({
        load({ cursor }) {
            const cursorAsNumber = cursor ? parseInt(cursor) : startingChunkIndex;
            setHasMoreToLoad((cursorAsNumber + 1) < chunkedData.length);

            return {
                items: chunkedData[cursorAsNumber],
                cursor: cursorAsNumber < chunkedData.length ? (cursorAsNumber + 1).toString() : undefined
            }
        }
    })

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