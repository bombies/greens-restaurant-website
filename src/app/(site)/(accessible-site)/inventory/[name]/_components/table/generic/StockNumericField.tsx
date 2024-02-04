"use client";

import { Fragment, useState } from "react";
import GenericModal from "../../../../../../../_components/GenericModal";
import StockNumericForm from "./forms/StockNumericForm";
import { StockSnapshot } from "@prisma/client";
import { dollarFormat } from "../../../../../../../../utils/GeneralUtils";
import GenericButton from "../../../../../../../_components/inputs/GenericButton";

type Props = {
    stockSnapshot: StockSnapshot,
    disabled?: boolean,
    onSet: (quantity: number) => Promise<void>,
    currency?: "selling" | "cost",
}

export default function StockNumericField({ stockSnapshot, onSet, disabled, currency }: Props) {
    const [editModalOpen, setEditModalOpen] = useState(false);

    return (
        <Fragment>
            <GenericModal
                isOpen={editModalOpen}
                onClose={() => {
                    setEditModalOpen(false);
                }}
                title={`Set ${stockSnapshot?.name?.replace("-", " ")} ${currency ? "Price" : "Stock"}`}
            >
                <StockNumericForm
                    onQuantitySubmit={async (quantity) => {
                        setEditModalOpen(false);
                        await onSet(quantity);
                    }}
                    buttonLabel={`Set ${currency ? "Price" : "Stock"}`}
                    disabled={disabled}
                    item={stockSnapshot}
                    min={0}
                    isCurrency={!!currency}
                />
            </GenericModal>
            <GenericButton
                className="tablet:!p-2"
                color="default"
                variant="light"
                onPress={() => {
                    if (disabled)
                        return;
                    setEditModalOpen(true);
                }}
            >
              <span className="text-sm">
                  {currency ? dollarFormat.format(currency === "cost" ? stockSnapshot.price : stockSnapshot.sellingPrice) : stockSnapshot.quantity}
              </span>
            </GenericButton>
        </Fragment>
    );
}