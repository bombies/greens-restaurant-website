"use client";

import { FC, Fragment, useState } from "react";
import ConfirmationModal from "../../../../../../../../_components/ConfirmationModal";
import { RequestedStockItemWithOptionalStockAndRequest } from "../../../inventory-requests-utils";
import IconButton from "../../../../../../../../_components/inputs/IconButton";
import TrashIcon from "../../../../../../../../_components/icons/TrashIcon";

type Props = {
    item: Partial<RequestedStockItemWithOptionalStockAndRequest>,
    removing?: boolean,
    onRemove?: (item: Partial<RequestedStockItemWithOptionalStockAndRequest>) => Promise<void>,
}

const RemoveRequestedItemButton: FC<Props> = ({ item, onRemove, removing }) => {
    const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);

    return (
        <Fragment>
            <ConfirmationModal
                isOpen={confirmationModalOpen}
                setOpen={setConfirmationModalOpen}
                title={`Remove ${item.stock?.name.replaceAll("-", " ")}`}
                message={`Are you sure you want to delete ${item.stock?.name.replaceAll("-", " ")}? This action cannot be undone.`}
                accepting={removing}
                onAccept={async () => {
                    if (onRemove)
                        await onRemove(item);
                }}
            />
            <IconButton
                variant="flat"
                color="danger"
                onPress={() => setConfirmationModalOpen(true)}
                toolTip="Remove Item"
            >
                <TrashIcon width={16} />
            </IconButton>
        </Fragment>
    );
};

export default RemoveRequestedItemButton;