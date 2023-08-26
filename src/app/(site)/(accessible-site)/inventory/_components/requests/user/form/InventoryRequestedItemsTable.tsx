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

interface Props {
    items: Partial<RequestedStockItemWithOptionalStock>[];
    isLoading?: boolean,
    adminActions?: boolean,
    showItemStatus?: boolean,
    onAdminAction?: OnAdminAction
    onSelfAction?: OnSelfAction
}

type OnAdminAction = {
    onApprove: (item: Partial<RequestedStockItemWithOptionalStockAndRequest>) => void,
    onPartialApprove: (item: Partial<RequestedStockItemWithOptionalStockAndRequest>, amountApproved: number) => void,
    onReject: (item: Partial<RequestedStockItemWithOptionalStockAndRequest>) => void,
}

type OnSelfAction = {
    onRemove: (item: Partial<RequestedStockItemWithOptionalStockAndRequest>) => void,
    onAmountChange?: (item: Partial<RequestedStockItemWithOptionalStockAndRequest>, newAmount: number) => void
}

const getValueForKey = (
    item: Partial<RequestedStockItemWithOptionalStockAndRequest>,
    key: Key, adminActions?: boolean,
    onAdminAction?: OnAdminAction,
    onSelfAction?: OnSelfAction
) => {
    switch (key) {
        case "item_name": {
            return <p className="capitalize">{item.stock?.name.replaceAll("-", " ")}</p>;
        }
        case "amount_requested": {
            return item.amountRequested;
        }
        case "actions": {
            return (
                <div className="flex gap-4">
                    {adminActions ?
                        <Fragment>
                            <IconButton
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
                        <Fragment></Fragment>
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
            else if (item.amountProvided === -1)
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
    }
};

const InventoryRequestedItemsTable: FC<Props> = ({
                                                     items,
                                                     isLoading,
                                                     adminActions,
                                                     onAdminAction,
                                                     onSelfAction,
                                                     showItemStatus
                                                 }) => {
    const columns: Column[] = useMemo(() => {
        const ret = [
            { key: "item_name", value: "Item Name" },
            { key: "amount_requested", value: "Amount Requested" }
        ];

        if (showItemStatus)
            ret.push({ key: "status", value: "Status" });
        ret.push({ key: "actions", value: "Actions" });
        return ret;
    }, [showItemStatus]);

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
                        <TableCell>{getValueForKey(item, colKey, adminActions, onAdminAction, onSelfAction)}</TableCell>
                    )}
                </TableRow>
            )}
        </GenericTable>
    );
};

export default InventoryRequestedItemsTable;