"use client";

import GenericModal from "../../../../../../../../../_components/GenericModal";
import { Dispatch, SetStateAction } from "react";
import StockNumericForm from "../../forms/StockNumericForm";
import PlusIcon from "../../../../../../../../../_components/icons/PlusIcon";
import { StockSnapshot } from "@prisma/client";

type Props = {
    disabled?: boolean,
    isOpen: boolean,
    setOpen: Dispatch<SetStateAction<boolean>>
    onClose?: () => void
    item?: StockSnapshot,
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
            title={`Add ${item?.name
                ?.replace(
                    /(\w)(\w*)/g,
                    (_g0, g1, g2) => g1.toUpperCase() + g2.toLowerCase()
                )
                .replace("-", " ")
            } Stock`}
        >
            <StockNumericForm
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