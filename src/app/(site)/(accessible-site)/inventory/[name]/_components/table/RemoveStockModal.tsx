"use client";

import GenericModal from "../../../../../../_components/GenericModal";
import { StockSnapshot } from "@prisma/client";
import GenericInput from "../../../../../../_components/inputs/GenericInput";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import GenericButton from "../../../../../../_components/inputs/GenericButton";
import { Spacer } from "@nextui-org/react";
import { Dispatch, SetStateAction } from "react";
import subtractIcon from "/public/icons/subtract.svg";

type Props = {
    disabled?: boolean,
    isOpen: boolean,
    setOpen: Dispatch<SetStateAction<boolean>>
    onClose: () => void
    item?: StockSnapshot
    onSubmit: SubmitHandler<FieldValues>
}

export default function RemoveStockModal({ isOpen, setOpen, onClose, item, onSubmit, disabled }: Props) {
    const {
        register,
        handleSubmit,
        formState: {
            errors
        }
    } = useForm<FieldValues>();

    return (
        <GenericModal
            isOpen={isOpen}
            onClose={() => {
                onClose();
                setOpen(false);
            }}
            title={`Remove ${item?.name
                ?.replace(
                    /(\w)(\w*)/g,
                    (g0, g1, g2) => g1.toUpperCase() + g2.toLowerCase()
                )
            } Stock`}
        >
            <form onSubmit={handleSubmit(onSubmit)}>
                <GenericInput
                    isDisabled={disabled}
                    register={register}
                    errors={errors}
                    id="quantity"
                    label="Quantity"
                    placeholder="Enter an amount to remove"
                    isRequired={true}
                    type="number"
                    max={item?.quantity}
                />
                <Spacer y={6} />
                <GenericButton
                    icon={subtractIcon}
                    disabled={disabled}
                    isLoading={disabled}
                    type="submit"
                >
                    Remove Stock
                </GenericButton>
            </form>

        </GenericModal>
    );
}