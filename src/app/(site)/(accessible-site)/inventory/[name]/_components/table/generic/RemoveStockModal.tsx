"use client";

import GenericModal from "../../../../../../../_components/GenericModal";
import { Dispatch, SetStateAction } from "react";
import StockNumericForm from "./forms/StockNumericForm";
import MinusIcon from "../../../../../../../_components/icons/MinusIcon";
import { StockSnapshot } from "@prisma/client";

type Props = {
    disabled?: boolean,
    isOpen: boolean,
    setOpen: Dispatch<SetStateAction<boolean>>
    onClose?: () => void
    item?: StockSnapshot
    onRemove: (removed: number) => Promise<void>,
    isUpdating?: boolean
}

export default function RemoveStockModal({ isOpen, setOpen, onClose, item, onRemove, isUpdating, disabled }: Props) {
    return (
        <GenericModal
            isOpen={isOpen}
            onClose={() => {
                if (onClose)
                    onClose();
                setOpen(false);
            }}
            title={`Remove ${item?.name
                ?.replace(
                    /(\w)(\w*)/g,
                    (_g0, g1, g2) => g1.toUpperCase() + g2.toLowerCase()
                )
                .replaceAll("-", " ")
            } Stock`}
        >
            <StockNumericForm
                onQuantitySubmit={onRemove}
                buttonLabel={"Remove Stock"}
                buttonIcon={<MinusIcon />}
                isWorking={isUpdating}
                disabled={disabled}
                item={item}
            />
        </GenericModal>
    );
}