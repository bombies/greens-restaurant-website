"use client";

import { Skeleton, Spacer, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@nextui-org/react";

type Column = {
    key: string,
    value: string,
}

type Props = {
    width?: string,
    contentRepeat?: number
    columns?: Column[],
}

export default function TableSkeleton({ width, contentRepeat, columns }: Props) {
    const content = [];
    for (let i = 0; i < (contentRepeat || 10); i++) {
        content.push(
            <TableRow key={i}>
                {columnKey => (
                    <TableCell key={columnKey}>
                        <Skeleton className="rounded-2xl w-full h-3" />
                    </TableCell>
                )}
            </TableRow>
        );
    }

    return (
        <Table
            classNames={{
                wrapper: "!bg-secondary/20 rounded-2xl",
                th: "bg-neutral-950/50 backdrop-blur-md text-white uppercase"
            }}
            aria-label="Stock Table"
            style={{
                width: width || "100%"
            }}
        >
            <TableHeader columns={columns}>
                {column => <TableColumn key={column.key}>{column.value}</TableColumn>}
            </TableHeader>
            <TableBody items={content}>
                {item => item}
            </TableBody>
        </Table>
    );
}