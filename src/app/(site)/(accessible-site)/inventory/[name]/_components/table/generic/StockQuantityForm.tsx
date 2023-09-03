"use client";

import { FC, ReactNode, useCallback, useMemo, useState } from "react";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import GenericInput from "../../../../../../../_components/inputs/GenericInput";
import { Spacer } from "@nextui-org/react";
import GenericButton from "../../../../../../../_components/inputs/GenericButton";
import DropdownInput from "../../../../../../../_components/inputs/DropdownInput";
import { StockSnapshot, StockType } from "@prisma/client";

type Props = {
    onQuantitySubmit: (quantity: number) => Promise<void>,
    disabled?: boolean,
    isWorking?: boolean,
    buttonLabel: string,
    buttonIcon?: ReactNode,
    item?: StockSnapshot,
}

enum QuantityUnit {
    DRINKS = "Drinks",
    BOTTLES = "Bottles",
    CASES = "Cases",
    ITEMS = "Items",
    DEFAULT = "Default"
}

const IMPERIAL_DRINKS_MAX = 33;
const QUART_DRINKS_MAX = 24;
const SIX_CASE_MAX = 6;
const TWELVE_CASE_MAX = 12;
const TWENTY_FOUR_CASE_MAX = 24;

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
            switch (item?.type) {
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
        else if (quantityUnit === QuantityUnit.CASES.toLowerCase())
            switch (item?.type) {
                case StockType.SIX_CASE: {
                    quantity *= SIX_CASE_MAX;
                    break;
                }
                case StockType.TWELVE_CASE: {
                    quantity *= TWELVE_CASE_MAX;
                    break;

                }
                case StockType.TWENTY_FOUR_CASE: {
                    quantity *= TWENTY_FOUR_CASE_MAX;
                    break;
                }
                default: {
                    break;
                }
            }

        onQuantitySubmit(Number(quantity))
            .then(() => reset());
    }, [item?.type, onQuantitySubmit, quantityUnit, reset]);

    const isCaseItem = useCallback(() => {
        return [StockType.SIX_CASE.toString(), StockType.TWELVE_CASE.toString(), StockType.TWENTY_FOUR_CASE.toString()]
            .includes(item?.type?.toString() ?? "");
    }, [item?.type]);

    const validKeys = useMemo(() => (
        isCaseItem() ?
            [QuantityUnit.CASES, QuantityUnit.ITEMS]
            :
            [QuantityUnit.BOTTLES, QuantityUnit.DRINKS]
    ), [isCaseItem]);

    const quantityDropdown = useMemo(() => (
        <DropdownInput
            selectedValueLabel
            selectionRequired
            variant="flat"
            keys={validKeys}
            selectedKeys={quantityUnit === QuantityUnit.DEFAULT ? [isCaseItem() ? QuantityUnit.ITEMS : QuantityUnit.DRINKS] : [quantityUnit]}
            setSelectedKeys={(keys) => setQuantityUnit(Array.from(keys)[0] as QuantityUnit)}
        />
    ), [isCaseItem, quantityUnit, validKeys]);

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
                    ((item?.type === StockType.IMPERIAL_BOTTLE || item?.type === StockType.QUART_BOTTLE) || isCaseItem())
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