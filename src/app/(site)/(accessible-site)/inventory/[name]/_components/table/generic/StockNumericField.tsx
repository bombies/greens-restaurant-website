"use client";

import { Fragment, useState } from "react";
import clsx from "clsx";
import GenericModal from "../../../../../../../_components/GenericModal";
import StockNumericForm from "./forms/StockNumericForm";
import { StockSnapshot } from "@prisma/client";
import { dollarFormat } from "../../../../../../../../utils/GeneralUtils";

type Props = {
    stockSnapshot: StockSnapshot,
    disabled?: boolean,
    onSet: (quantity: number) => Promise<void>,
    isCurrency?: boolean,
}

export default function StockNumericField({ stockSnapshot, onSet, disabled, isCurrency }: Props) {
    const [editModalOpen, setEditModalOpen] = useState(false);

    return (
        <Fragment>
            <GenericModal
                isOpen={editModalOpen}
                onClose={() => {
                    setEditModalOpen(false);
                }}
                title={`Set ${stockSnapshot?.name?.replace("-", " ")} ${isCurrency ? "Price" : "Stock"}`}
            >
                <StockNumericForm
                    onQuantitySubmit={async (quantity) => {
                        setEditModalOpen(false);
                        await onSet(quantity);
                    }}
                    buttonLabel={`Set ${isCurrency ? "Price" : "Stock"}`}
                    disabled={disabled}
                    item={stockSnapshot}
                    min={0}
                    isCurrency={isCurrency}
                />
            </GenericModal>
            <p className={clsx(
                "border-2 border-neutral-800/0 transition-fast w-fit py-3 px-5",
                !disabled && "hover:default-container cursor-pointer"
            )}
               onClick={() => {
                   if (disabled)
                       return;
                   setEditModalOpen(true);
               }}>
                {isCurrency ? dollarFormat.format(stockSnapshot.price) : stockSnapshot.quantity}
            </p>
        </Fragment>
    );
}