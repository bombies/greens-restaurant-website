"use client";

import GenericModal from "../../../../../../_components/GenericModal";
import { StockSnapshot } from "@prisma/client";
import GenericInput from "../../../../../../_components/inputs/GenericInput";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import GenericButton from "../../../../../../_components/inputs/GenericButton";
import { Spacer } from "@nextui-org/react";
import { Dispatch, SetStateAction } from "react";

type Props = {
    isOpen: boolean,
    setOpen: Dispatch<SetStateAction<boolean>>
    onClose: () => void
    item?: StockSnapshot
}

export default function AddStockModal({ isOpen, setOpen, onClose, item }: Props) {
    const {
        register,
        handleSubmit,
        formState: {
            errors
        }
    } = useForm<FieldValues>();

    const onSubmit: SubmitHandler<FieldValues> = (data) => {
        setOpen(false);
    };

    return (
        <GenericModal
            isOpen={isOpen}
            onClose={() => {
                onClose();
                setOpen(false);
            }}
            title={`Add ${item?.name
                ?.replace(
                    /(\w)(\w*)/g,
                    (g0, g1, g2) => g1.toUpperCase() + g2.toLowerCase()
                )
            } Stock`}
        >
            <form onSubmit={handleSubmit(onSubmit)}>
                <GenericInput
                    register={register}
                    errors={errors}
                    id="quantity"
                    label="Quantity"
                    placeholder="Enter an amount to add"
                    isRequired={true}
                    type="number"
                    min={1}
                />
                <Spacer y={6} />
                <GenericButton type="submit">Add Stock</GenericButton>
            </form>

        </GenericModal>
    );
}