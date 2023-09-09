"use client";

import { FC, Fragment } from "react";
import GenericTable from "../../../../../../_components/table/GenericTable";
import { TableCell, TableRow } from "@nextui-org/react";
import { InventorySectionSnapshotWithOptionalExtras } from "../../../../../../api/inventory/bar/[name]/types";
import useChecksAndBalancesTableParams from "./useChecksAndBalancesTableParams";

type Props = {
    currentSnapshot?: InventorySectionSnapshotWithOptionalExtras,
    previousSnapshot: InventorySectionSnapshotWithOptionalExtras,
}

const ChecksAndBalancesTable: FC<Props> = ({ previousSnapshot, currentSnapshot }) => {
    const { columns, getKeyValue, items } = useChecksAndBalancesTableParams({ previousSnapshot, currentSnapshot });

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