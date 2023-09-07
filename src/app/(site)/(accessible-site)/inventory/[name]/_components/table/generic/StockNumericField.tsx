"use client";

import { Fragment, useState } from "react";
import clsx from "clsx";
import GenericModal from "../../../../../../../_components/GenericModal";
import StockNumericForm from "./forms/StockNumericForm";
import { StockSnapshot } from "@prisma/client";
import { dollarFormat } from "../../../../../../../../utils/GeneralUtils";
import GenericButton from "../../../../../../../_components/inputs/GenericButton";

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
            <GenericButton
                color="default"
                variant="light"
                onPress={() => {
                    if (disabled)
                        return;
                    setEditModalOpen(true);
                }}
            >
                {isCurrency ? dollarFormat.format(stockSnapshot.price) : stockSnapshot.quantity}
            </GenericButton>
        </Fragment>
    );
}