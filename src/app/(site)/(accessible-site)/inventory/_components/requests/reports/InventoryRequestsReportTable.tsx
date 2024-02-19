"use client";

import { FC, Key } from "react";
import {
    InventoryRequestsReportActions,
    RequestedStockItemWithExtrasAndRequestExtras,
    useInventoryRequestsReport
} from "./InventoryRequestsReportProvider";
import { Column } from "../../../../invoices/[id]/[invoiceId]/components/table/InvoiceTable";
import { getStatusChip } from "../../hooks/useRequestStatus";
import { StockRequestStatus } from ".prisma/client";
import { AvatarGroup, TableCell, TableRow } from "@nextui-org/react";
import UserAvatar from "../../../../../../_components/UserAvatar";
import { Spinner } from "@nextui-org/spinner";
import SubTitle from "../../../../../../_components/text/SubTitle";
import { Divider } from "@nextui-org/divider";
import GenericTable from "../../../../../../_components/table/GenericTable";
import InventoryRequestsReportFilters from "./InventoryRequestsReportFilters";
import useToggleableColumns from "../../../../../../hooks/table/useToggleableColumns";

const columns: Column[] = [
    {
        key: "item",
        value: "Item"
    },
    {
        key: "goods_requested",
        value: "Goods Requested"
    },
    {
        key: "goods_received",
        value: "Goods Received"
    },
    {
        key: "status",
        value: "Status"
    },
    {
        key: "location",
        value: "Location"
    },
    {
        key: "requested_by",
        value: "Requested By"
    },
    {
        key: "assigned_to",
        value: "Assigned To"

    },
    {
        key: "reviewed_by",
        value: "Reviewed By"
    },
    {
        key: "date_requested",
        value: "Date Delivered"
    }
];

const fetchValueForKey = (key: Key, item: RequestedStockItemWithExtrasAndRequestExtras) => {
    switch (key) {
        case "item":
            return <span className="capitalize">{item.stock?.name.replaceAll("-", " ")}</span>;
        case "goods_requested":
            return item.amountRequested;
        case "goods_received":
            return item.amountProvided ?? "N/A";
        case "status":
            return getStatusChip(
                item.amountProvided === null ? StockRequestStatus.PENDING : (
                    item.amountProvided >= item.amountRequested ? StockRequestStatus.DELIVERED : (
                        item.amountProvided > 0 ? StockRequestStatus.PARTIALLY_DELIVERED : StockRequestStatus.REJECTED
                    )
                )
            );
        case "assigned_to": {
            return (
                <AvatarGroup>
                    {item.assignedTo?.map(assignee => (
                        <UserAvatar key={`${item.id}#${assignee.id}`} showToolTip user={assignee} />
                    ))}
                </AvatarGroup>
            );
        }
        case "location": {
            return (
                <span className="capitalize">
                    {item?.assignedLocation?.name.replaceAll("-", " ")}
                </span>
            );
        }
        case "reviewed_by": {
            return item.reviewedBy && <UserAvatar showToolTip user={item.reviewedBy} />;
        }
        case "requested_by": {
            return item.requestedBy && <UserAvatar showToolTip user={item.requestedBy} />;
        }
        case "date_requested":
            return new Date(item.deliveredAt ?? item.createdAt).toLocaleDateString();
    }
};

const InventoryRequestsReportTable: FC = () => {
    const [{
        data: { isFetching, visibleData: requests, data: allData },
        table: { sortDescriptor },
    }, dispatch] = useInventoryRequestsReport();
    const { columns: visibleColumns, toggleColumn, setColumnVisible } = useToggleableColumns(columns, [
        "reviewed_by",
        "requested_by",
        "assigned_to"
    ]);

    return (
        <>
            {(allData && allData.length) ? (
                <>
                    <InventoryRequestsReportFilters />
                    <Divider className="my-6" />
                </>
            ) : <></>}
            {isFetching ? (
                <Spinner size="lg" />
            ) : (
                requests ? (requests.length > 0 ? (
                    <>
                        {/*<CheckboxMenu*/}
                        {/*    buttonProps={{*/}
                        {/*        startContent: <FilterIcon />,*/}
                        {/*        isIconOnly: false,*/}
                        {/*        children: "Filter Columns"*/}
                        {/*    }}*/}
                        {/*    checkboxGroupProps={{*/}
                        {/*        label: "Filter",*/}
                        {/*        value: visibleColumns.map(column => column.key),*/}
                        {/*        onValueChange(value) {*/}
                        {/*            const removedColumns = visibleColumns.filter(column => !value.includes(column.key));*/}
                        {/*            const addedColumns = columns.filter(column => value.includes(column.key));*/}
                        {/*            removedColumns.forEach(column => setColumnVisible(column.key, false));*/}
                        {/*            addedColumns.forEach(column => setColumnVisible(column.key, true));*/}
                        {/*        }*/}
                        {/*    }}*/}
                        {/*>*/}
                        {/*    {columns.map(column => (*/}
                        {/*        <Checkbox*/}
                        {/*            key={column.key}*/}
                        {/*            value={column.key}*/}
                        {/*        >*/}
                        {/*            {column.value}*/}
                        {/*        </Checkbox>*/}
                        {/*    ))}*/}
                        {/*</CheckboxMenu>*/}
                        {/*<Spacer y={6} />*/}
                        <GenericTable
                            isHeaderSticky
                            isCompact
                            columns={visibleColumns}
                            items={requests}
                            sortDescriptor={sortDescriptor}
                            sortableColumns={["date_requested"]}
                            onSortChange={sortDescriptor => {
                                console.log(sortDescriptor)
                                dispatch({
                                    type: InventoryRequestsReportActions.UPDATE_TABLE,
                                    payload: { sortDescriptor }
                                });
                            }}
                        >
                            {request => (
                                <TableRow key={`${request.id}#${request.stockId}`}>
                                    {key => (
                                        <TableCell>{fetchValueForKey(key, request)}</TableCell>
                                    )}
                                </TableRow>
                            )}
                        </GenericTable>
                    </>
                ) : (
                    <SubTitle className="text-lg">No requests found...</SubTitle>
                )) : (
                    <SubTitle className="text-lg">Select a start or end date to generate a report</SubTitle>
                )
            )}
        </>

    );
};

export default InventoryRequestsReportTable;