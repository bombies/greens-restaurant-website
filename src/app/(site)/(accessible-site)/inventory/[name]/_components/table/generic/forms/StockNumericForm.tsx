"use client";

import { FC, ReactNode, useCallback, useState } from "react";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import GenericInput from "../../../../../../../../_components/inputs/GenericInput";
import { Spacer } from "@nextui-org/react";
import GenericButton from "../../../../../../../../_components/inputs/GenericButton";
import { StockSnapshot } from "@prisma/client";
import StockQuantityDropdown, { QuantityUnit } from "./StockQuantityDropdown";
import useStockQuantityDropdownUtils from "./useStockQuantityDropdownUtils";

type Props = {
    onQuantitySubmit: (quantity: number) => Promise<void>,
    disabled?: boolean,
    isWorking?: boolean,
    buttonLabel: string,
    buttonIcon?: ReactNode,
    item?: StockSnapshot,
    min?: number,
    isCurrency?: boolean,
    defaultValue?: keyof Pick<StockSnapshot, "quantity">
}

const StockNumericForm: FC<Props> = ({
                                         onQuantitySubmit,
                                         isWorking,
                                         disabled,
                                         buttonIcon,
                                         buttonLabel,
                                         item,
                                         min,
                                         isCurrency,
                                         defaultValue
                                     }) => {
    const [quantity, setQuantity] = useState(item && defaultValue ? item[defaultValue] ?? 0 : 0);
    const { isCaseItem, isDrinkBottle, mutateQuantity } = useStockQuantityDropdownUtils({ itemType: item?.type });
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
        const quantity = mutateQuantity(Number(data.quantity), quantityUnit);
        onQuantitySubmit(Number(quantity))
            .then(() => reset());
    }, [mutateQuantity, onQuantitySubmit, quantityUnit, reset]);

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <GenericInput
                isDisabled={disabled || isWorking}
                register={register}
                errors={errors}
                id="quantity"
                label={isCurrency ? "Price" : "Quantity"}
                placeholder="Enter an amount..."
                isRequired={true}
                type="number"
                value={quantity.toString()}
                onValueChange={(value) => setQuantity(Number(value))}
                step={isCurrency ? "0.01" : undefined}
                endContent={
                    (!isCurrency && (isDrinkBottle() || isCaseItem()))
                    &&
                    <StockQuantityDropdown
                        itemType={item?.type}
                        selectedUnit={quantityUnit}
                        setSelectedUnit={setQuantityUnit}
                    />
                }
                startContent={isCurrency && "JMD"}
                min={min ?? 1}
            />
            <Spacer y={6} />
            <GenericButton
                disabled={disabled || isWorking}
                isLoading={isWorking}
                type="submit"
                variant="flat"
                startContent={buttonIcon}
                className="capitalize"
            >
                {buttonLabel}
            </GenericButton>
        </form>
    );
};

export default StockNumericForm;