"use client";

import GenericModal from "../../../../../../../../../_components/GenericModal";
import { Dispatch, SetStateAction } from "react";
import { StockSnapshot, StockType } from "@prisma/client";
import EditStockTypeForm from "../../forms/EditStockTypeForm";

type Props = {
    disabled?: boolean,
    isOpen: boolean,
    setOpen: Dispatch<SetStateAction<boolean>>
    onClose?: () => void
    item?: StockSnapshot,
    onEdit: (newType: StockType) => Promise<void>,
    isUpdating?: boolean
}

export default function EditStockTypeModal({ isOpen, setOpen, onClose, item, onEdit, isUpdating, disabled }: Props) {

    return (
        <GenericModal
            isOpen={isOpen}
            onClose={() => {
                if (onClose)
                    onClose();
                setOpen(false);
            }}
            title={`Edit ${item?.name
                ?.replace(
                    /(\w)(\w*)/g,
                    (_g0, g1, g2) => g1.toUpperCase() + g2.toLowerCase()
                )
                .replace("-", " ")
            } Stock Type`}
        >
            <EditStockTypeForm
                currentType={item?.type ?? StockType.DEFAULT}
                onEdit={onEdit}
                disabled={disabled}
            />
        </GenericModal>
    );
}