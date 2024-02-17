"use client"

import GenericModal from "@/app/_components/GenericModal";
import GenericButton from "@/app/_components/inputs/GenericButton";
import GenericInput from "@/app/_components/inputs/GenericInput";
import { Spacer } from "@nextui-org/react";
import { StockType } from "@prisma/client";
import { FC, useCallback, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { isCaseType, isDrinkBottleType, mutateQuantityUnit } from "../../../inventory/[name]/_components/table/generic/forms/useStockQuantityDropdownUtils";
import StockQuantityDropdown, { QuantityUnit } from "../../../inventory/[name]/_components/table/generic/forms/StockQuantityDropdown";

type Props = {
    stockType: StockType
    defaultValue: number
    isOpen: boolean
    onClose: () => void
    onEdit?: (newThreshold: number) => void
}

type FormProps = {
    threshold: string
}

const EditLowStockThresholdModal: FC<Props> = ({ stockType, isOpen, onClose, onEdit, defaultValue }) => {
    const { register, handleSubmit, formState: { errors }, reset } = useForm<FormProps>()
    const [currentValue, setCurrentValue] = useState(defaultValue.toString())
    const [quantityUnit, setQuantityUnit] = useState<QuantityUnit>(QuantityUnit.DEFAULT)

    const onSubmit = useCallback<SubmitHandler<FormProps>>(({ threshold }) => {
        onEdit?.(mutateQuantityUnit(stockType, parseInt(threshold), quantityUnit))
        reset()
    }, [onEdit, quantityUnit, reset, stockType])

    return (
        <GenericModal
            title={`Edit Threshold For ${stockType.replaceAll("_", " ").toLowerCase()}`}
            isOpen={isOpen}
            onClose={onClose}
        >
            <form onSubmit={handleSubmit(onSubmit)}>
                <GenericInput
                    type="number"
                    value={currentValue}
                    onValueChange={setCurrentValue}
                    register={register}
                    errors={errors}
                    id="threshold"
                    label={`New Threshold`}
                    isRequired
                    endContent={
                        (isDrinkBottleType(stockType) || isCaseType(stockType)) && (
                            <StockQuantityDropdown
                                itemType={stockType}
                                selectedUnit={quantityUnit}
                                setSelectedUnit={setQuantityUnit}
                            />
                        )
                    }
                />
                <Spacer y={6} />
                <GenericButton type="submit">
                    Update
                </GenericButton>
            </form>
        </GenericModal>
    )
}

export default EditLowStockThresholdModal