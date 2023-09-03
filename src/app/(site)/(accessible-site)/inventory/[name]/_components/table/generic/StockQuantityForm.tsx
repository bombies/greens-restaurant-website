"use client";

import { FC, ReactNode, useCallback, useMemo, useState } from "react";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import GenericInput from "../../../../../../../_components/inputs/GenericInput";
import { Spacer } from "@nextui-org/react";
import GenericButton from "../../../../../../../_components/inputs/GenericButton";
import { StockSnapshotWithStock } from "../../../../../../../api/inventory/[name]/utils";
import DropdownInput from "../../../../../../../_components/inputs/DropdownInput";
import { StockType } from "@prisma/client";

type Props = {
    onQuantitySubmit: (quantity: number) => Promise<void>,
    disabled?: boolean,
    isWorking?: boolean,
    buttonLabel: string,
    buttonIcon?: ReactNode,
    item?: StockSnapshotWithStock,
}

enum QuantityUnit {
    DRINKS = "Drinks",
    BOTTLES = "Bottles",
    DEFAULT = "Default"
}

const IMPERIAL_DRINKS_MAX = 33;
const QUART_DRINKS_MAX = 24;

const StockQuantityForm: FC<Props> = ({ onQuantitySubmit, isWorking, disabled, buttonIcon, buttonLabel, item }) => {
    const [quantityUnit, setQuantityUnit] = useState<QuantityUnit>(QuantityUnit.DEFAULT);
    const {
        register,
        handleSubmit,
        formState: {
            errors
        },
        reset
    } = useForm<FieldValues>();

    const onSubmit: SubmitHandler<FieldValues> = useCallback((data) => {
        let { quantity } = data;

        if (quantityUnit === QuantityUnit.BOTTLES.toLowerCase())
            switch (item?.stock.type) {
                case StockType.QUART_BOTTLE: {
                    quantity *= QUART_DRINKS_MAX;
                    break;
                }
                case StockType.IMPERIAL_BOTTLE: {
                    quantity *= IMPERIAL_DRINKS_MAX;
                    break;
                }
                default: {
                    break;
                }
            }

        onQuantitySubmit(Number(quantity))
            .then(() => reset());
    }, [item?.stock.type, onQuantitySubmit, quantityUnit, reset]);

    const quantityDropdown = useMemo(() => (
        <DropdownInput
            selectedValueLabel
            selectionRequired
            variant="flat"
            keys={[QuantityUnit.BOTTLES, QuantityUnit.DRINKS]}
            selectedKeys={quantityUnit === QuantityUnit.DEFAULT ? [QuantityUnit.DRINKS] : [quantityUnit]}
            setSelectedKeys={(keys) => setQuantityUnit(Array.from(keys)[0] as QuantityUnit)}
        />
    ), [quantityUnit]);

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <GenericInput
                isDisabled={disabled || isWorking}
                register={register}
                errors={errors}
                id="quantity"
                label="Quantity"
                placeholder="Enter an amount..."
                isRequired={true}
                type="number"
                endContent={
                    (item?.stock.type === StockType.IMPERIAL_BOTTLE || item?.stock.type === StockType.QUART_BOTTLE)
                    && quantityDropdown
                }
                min={1}
            />
            <Spacer y={6} />
            <GenericButton
                disabled={disabled || isWorking}
                isLoading={isWorking}
                type="submit"
                variant="flat"
                startContent={buttonIcon}
            >
                {buttonLabel}
            </GenericButton>
        </form>
    );
};

export default StockQuantityForm;