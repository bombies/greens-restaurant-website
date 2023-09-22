"use client";

import { FC, Fragment } from "react";
import GenericTable from "../../../../../../../_components/table/GenericTable";
import { TableCell, TableRow } from "@nextui-org/react";
import { InventorySectionSnapshotWithOptionalExtras } from "../../../../../../../api/inventory/location/[name]/types";
import useChecksAndBalancesTableParams from "./useChecksAndBalancesTableParams";
import { RequestedStockItem } from "@prisma/client";

type Props = {
    currentSnapshot?: InventorySectionSnapshotWithOptionalExtras,
    previousSnapshot: InventorySectionSnapshotWithOptionalExtras,
    requestedStockItems: RequestedStockItem[]
}

const ChecksAndBalancesTable: FC<Props> = ({ previousSnapshot, currentSnapshot, requestedStockItems }) => {
    const { columns, getKeyValue, items } = useChecksAndBalancesTableParams({
        previousSnapshot,
        currentSnapshot,
        requestedStockItems
    });

    return (
        <Fragment>
            <GenericTable
                columns={columns}
                items={items}
                emptyContent="There was no previous data found..."
            >
                {item => (
                    <TableRow>
                        {colKey => <TableCell>{getKeyValue(item, colKey)}</TableCell>}
                    </TableRow>
                )}
            </GenericTable>
        </Fragment>
    );
};

export default ChecksAndBalancesTable;