"use client";

import GenericModal from "../../../../../../../_components/GenericModal";
import { Dispatch, SetStateAction, useCallback } from "react";
import { StockSnapshotWithStock } from "../../../../../../../api/inventory/[name]/utils";
import StockQuantityForm from "./StockQuantityForm";
import PlusIcon from "../../../../../../../_components/icons/PlusIcon";

type Props = {
    disabled?: boolean,
    isOpen: boolean,
    setOpen: Dispatch<SetStateAction<boolean>>
    onClose?: () => void
    item?: StockSnapshotWithStock,
    onAdd: (amountAdded: number) => Promise<void>,
    isUpdating?: boolean
}

export default function AddStockModal({ isOpen, setOpen, onClose, item, onAdd, isUpdating, disabled }: Props) {
    return (
        <GenericModal
            isOpen={isOpen}
            onClose={() => {
                if (onClose)
                    onClose();
                setOpen(false);
            }}
            title={`Add ${item?.stock.name
                ?.replace(
                    /(\w)(\w*)/g,
                    (g0, g1, g2) => g1.toUpperCase() + g2.toLowerCase()
                )
                .replace("-", " ")
            } Stock`}
        >
            <StockQuantityForm
                onQuantitySubmit={onAdd}
                buttonLabel={"Add Stock"}
                buttonIcon={<PlusIcon />}
                isWorking={isUpdating}
                disabled={disabled}
                item={item}
            />
        </GenericModal>
    );
}