"use client";

import { Fragment, useState } from "react";
import clsx from "clsx";
import GenericModal from "../../../../../../../_components/GenericModal";
import { StockSnapshot } from "@prisma/client";
import StockTextForm from "./forms/StockTextForm";
import "../../../../../../../../utils/GeneralUtils";
import { INVENTORY_NAME_REGEX } from "../../../../../../../../utils/regex";

type Props = {
    stockSnapshot: StockSnapshot,
    field: keyof Pick<StockSnapshot, "name">,
    disabled?: boolean,
    onSet: (text: string) => Promise<void>,
}

export default function StockTextField({ stockSnapshot, field, onSet, disabled }: Props) {
    const [editModalOpen, setEditModalOpen] = useState(false);

    return (
        <Fragment>
            <GenericModal
                isOpen={editModalOpen}
                onClose={() => {
                    setEditModalOpen(false);
                }}
                title={`Set ${field}`}
            >
                <StockTextForm
                    onTextSubmit={async (text) => {
                        setEditModalOpen(false);
                        await onSet(text);
                    }}
                    buttonLabel={`Set ${field.capitalize()}`}
                    disabled={disabled}
                    form={{
                        label: field.capitalize()
                    }}
                    defaultValue={field === "name" ? stockSnapshot.name.replaceAll("-", " ") : undefined}
                    validate={{
                        test(text) {
                            switch (field) {
                                case "name": {
                                    return INVENTORY_NAME_REGEX.test(text);
                                }
                                default: {
                                    return true;
                                }
                            }
                        },
                        failMessage: field === "name" ? "Invalid item name! " +
                            "The item name must not be more than 30 characters. " +
                            "It should also not include any special characters. " +
                            "The item name must also start with a letter." : undefined
                    }}
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
                {stockSnapshot[field].replaceAll("-", " ")}
            </p>
        </Fragment>
    );
}