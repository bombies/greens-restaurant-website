"use client";

import { Fragment, useState } from "react";
import clsx from "clsx";
import GenericModal from "../../../../../../../_components/GenericModal";
import StockQuantityForm from "./StockQuantityForm";
import { StockSnapshot } from "@prisma/client";

type Props = {
    stockSnapshot: StockSnapshot,
    disabled?: boolean,
    onSet: (quantity: number) => Promise<void>;
}

export default function StockQuantityField({ stockSnapshot, onSet, disabled }: Props) {
    const [editModalOpen, setEditModalOpen] = useState(false);

    return (
        <Fragment>
            <GenericModal
                isOpen={editModalOpen}
                onClose={() => {
                    setEditModalOpen(false);
                }}
                title={`Set ${stockSnapshot?.name
                    ?.replace(
                        /(\w)(\w*)/g,
                        (_g0, g1, g2) => g1.toUpperCase() + g2.toLowerCase()
                    )
                    .replace("-", " ")
                } Stock`}
            >
                <StockQuantityForm
                    onQuantitySubmit={async (quantity) => {
                        onSet(quantity)
                        setEditModalOpen(false)
                    }}
                    buttonLabel="Set Stock"
                    disabled={disabled}
                    item={stockSnapshot}
                />
            </GenericModal>
            <p className={clsx(
                "cursor-pointer border-2 border-neutral-800/0 hover:default-container transition-fast w-fit py-3 px-5"
            )}
               onClick={() => {
                   if (disabled)
                       return;
                   setEditModalOpen(true);
               }}>
                {stockSnapshot.quantity}
            </p>
        </Fragment>
    );
}