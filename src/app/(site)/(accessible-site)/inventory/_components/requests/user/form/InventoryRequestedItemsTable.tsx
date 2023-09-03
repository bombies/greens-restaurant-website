"use client";

import { FC, Fragment, Key, useMemo } from "react";
import GenericTable from "../../../../../../../_components/table/GenericTable";
import { CircularProgress, TableCell, TableRow, Tooltip } from "@nextui-org/react";
import { Column } from "../../../../../invoices/[id]/[invoiceId]/components/table/InvoiceTable";
import {
    RequestedStockItemWithOptionalStock,
    RequestedStockItemWithOptionalStockAndRequest
} from "../../inventory-requests-utils";
import IconButton from "../../../../../../../_components/inputs/IconButton";
import DeniedIcon from "../../../../../../../_components/icons/DeniedIcon";
import CheckIcon from "../../../../../../../_components/icons/CheckIcon";
import PartialApproveButton from "./admin-actions/PartialApproveButton";
import { Chip } from "@nextui-org/chip";
import PendingIcon from "../../../../../../../_components/icons/PendingIcon";
import EditAmountRequestedButton from "./self-actions/EditAmountRequestedButton";
import RemoveRequestedItemButton from "./self-actions/RemoveRequestedItemButton";
import {
    InventorySnapshotWithOptionalExtras
} from "../../../../../../../api/inventory/[name]/utils";
import { StockSnapshot } from "@prisma/client";
import { StockRequestStatus } from ".prisma/client";

interface Props {
    items: Partial<RequestedStockItemWithOptionalStock>[];
    isLoading?: boolean,
    adminActions?: boolean,
    showItemStatus?: boolean,
    onAdminAction?: OnAdminAction,
    onSelfAction?: OnSelfAction,
    inventorySnapshots?: InventorySnapshotWithOptionalExtras[],
    requestStatus?: StockRequestStatus
}

type OnAdminAction = {
    onApprove: (item: Partial<RequestedStockItemWithOptionalStockAndRequest>) => void,
    onPartialApprove: (item: Partial<RequestedStockItemWithOptionalStockAndRequest>, amountApproved: number) => void,
    onReject: (item: Partial<RequestedStockItemWithOptionalStockAndRequest>) => void,
}

type OnSelfAction = {
    onRemove: {
        removing?: boolean,
        action: (item: Partial<RequestedStockItemWithOptionalStockAndRequest>) => Promise<void>
    },
    onAmountChange?: {
        editing?: boolean,
        action: (item: Partial<RequestedStockItemWithOptionalStockAndRequest>, newAmount: number) => Promise<void>
    }
}

const getValueForKey = (
    item: Partial<RequestedStockItemWithOptionalStockAndRequest>,
    key: Key, adminActions?: boolean,
    onAdminAction?: OnAdminAction,
    onSelfAction?: OnSelfAction,
    snapshots?: StockSnapshot[]
) => {
    const findItemSnapshot = (): StockSnapshot | undefined => snapshots?.find(snapshot => snapshot.uid === item.stock?.uid);

    switch (key) {
        case "item_name": {
            return <p className="capitalize">{item.stock?.name.replaceAll("-", " ")}</p>;
        }
        case "amount_requested": {
            return item.amountRequested;
        }
        case "actions": {
            const itemSnapshot = findItemSnapshot();

            return (
                <div className="flex gap-4">
                    {adminActions ?
                        <Fragment>
                            <IconButton
                                isDisabled={(itemSnapshot?.quantity ?? 0) < (item.amountRequested ?? 0)}
                                variant="flat"
                                color="success"
                                toolTip="Approve"
                                onPress={() => {
                                    if (onAdminAction && onAdminAction.onApprove)
                                        onAdminAction.onApprove(item);
                                }}
                            >
                                <CheckIcon width={16} />
                            </IconButton>
                            <PartialApproveButton
                                item={item}
                                max={(itemSnapshot?.quantity ?? 0) < (item.amountRequested ?? 0) ? itemSnapshot?.quantity : undefined}
                                onPartialApprove={onAdminAction?.onPartialApprove}
                            />
                            <IconButton
                                variant="flat"
                                color="danger"
                                toolTip="Reject"
                                onPress={() => {
                                    if (onAdminAction?.onReject)
                                        onAdminAction.onReject(item);
                                }}
                            >
                                <DeniedIcon width={16} />
                            </IconButton>
                        </Fragment>
                        :
                        <Fragment>
                            <EditAmountRequestedButton
                                item={item}
                                onAmountChange={onSelfAction?.onAmountChange?.action}
                                editing={onSelfAction?.onAmountChange?.editing}
                            />
                            <RemoveRequestedItemButton
                                item={item}
                                onRemove={onSelfAction?.onRemove.action}
                                removing={onSelfAction?.onRemove.removing}
                            />
                        </Fragment>
                    }
                </div>
            );
        }
        case "status": {
            if (item.amountRequested === item.amountProvided)
                return (
                    <Chip
                        variant="flat"
                        color="success"
                        classNames={{
                            content: "font-semibold"
                        }}
                        startContent={<CheckIcon width={16} />}
                    >
                        APPROVED
                    </Chip>
                );
            else if (item.amountProvided === 0)
                return (
                    <Chip
                        variant="flat"
                        color="danger"
                        classNames={{
                            content: "font-semibold"
                        }}
                        startContent={<DeniedIcon width={16} />}
                    >
                        REJECTED
                    </Chip>
                );
            else if (item.amountProvided === -1 || item.amountProvided === null || item.amountProvided === undefined)
                return (
                    <Chip
                        variant="flat"
                        classNames={{
                            content: "font-semibold"
                        }}
                        startContent={<PendingIcon width={16} />}
                    >
                        PENDING
                    </Chip>
                );
            else return (
                    <div className="flex gap-4">
                        <Tooltip
                            color="warning"
                            content={`${item.amountProvided} PROVIDED`}
                        >
                            <Chip
                                variant="flat"
                                color="warning"
                                classNames={{
                                    content: "font-semibold"
                                }}
                                startContent={<CheckIcon width={16} />}
                            >
                                PARTIALLY APPROVED
                            </Chip>
                        </Tooltip>
                        <CircularProgress
                            color="warning"
                            size="sm"
                            value={item.amountProvided && item.amountRequested ? (item.amountProvided / item.amountRequested) * 100 : 0}
                        />
                    </div>
                );
        }
        case "amount_available": {
            return findItemSnapshot()?.quantity ?? "Unknown";
        }
    }
};

const InventoryRequestedItemsTable: FC<Props> = ({
                                                     items,
                                                     isLoading,
                                                     adminActions,
                                                     onAdminAction,
                                                     onSelfAction,
                                                     showItemStatus,
                                                     inventorySnapshots,
                                                     requestStatus
                                                 }) => {
    const columns: Column[] = useMemo(() => {
        const ret = [
            { key: "item_name", value: "Item Name" },
            { key: "amount_requested", value: "Amount Requested" }
        ];

        if (requestStatus === StockRequestStatus.PENDING && adminActions && onAdminAction)
            ret.push({ key: "amount_available", value: "Amount Available" });
        if (showItemStatus)
            ret.push({ key: "status", value: "Status" });
        if ((adminActions && onAdminAction) || onSelfAction)
            ret.push({ key: "actions", value: "Actions" });

        return ret;
    }, [adminActions, onAdminAction, onSelfAction, requestStatus, showItemStatus]);

    const stockSnapshots = useMemo(() => {
        return inventorySnapshots?.map(invSnapshot => invSnapshot.stockSnapshots!).flat();
    }, [inventorySnapshots]);

    return (
        <GenericTable
            columns={columns}
            items={items}
            isLoading={isLoading}
            emptyContent="Select an inventory then click on the button below to start requesting items."
        >
            {(item) => (
                <TableRow key={item.id}>
                    {(colKey) => (
                        <TableCell>{getValueForKey(
                            item,
                            colKey,
                            adminActions,
                            onAdminAction,
                            onSelfAction,
                            stockSnapshots
                        )}</TableCell>
                    )}
                </TableRow>
            )}
        </GenericTable>
    );
};

export default InventoryRequestedItemsTable;