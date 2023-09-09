"use client";

import { FC, useCallback, useState } from "react";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import ItemTypeSelectMenu from "../ItemTypeSelectMenu";
import { StockType } from "@prisma/client";
import GenericButton from "../../../../../../../../_components/inputs/GenericButton";
import EditIcon from "../../../../../../../../_components/icons/EditIcon";
import { toast } from "react-hot-toast";

type Props = {
    currentType: StockType,
    isWorking?: boolean,
    disabled?: boolean,
    onEdit: (newType: StockType) => Promise<void>
}

const EditStockTypeForm: FC<Props> = ({ currentType, onEdit, isWorking, disabled }) => {
    const [selectedStockType, setSelectedStockType] = useState<StockType>(currentType);
    const {
        register,
        handleSubmit,
        reset
    } = useForm();

    const onSubmit: SubmitHandler<FieldValues> = useCallback((data) => {
        const { itemType } = data;
        if (!itemType) {
            toast.error("There was an error editing this item's type!");
            console.error("Falsy item type value", data);
            return;
        }

        onEdit(itemType.toUpperCase())
            .then(() => reset());
    }, [onEdit, reset]);

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4">
                <ItemTypeSelectMenu
                    selectedStockType={selectedStockType}
                    setSelectedStockType={setSelectedStockType}
                    register={register}
                    disabled={disabled || isWorking}
                />
                <GenericButton
                    isDisabled={disabled || isWorking}
                    isLoading={isWorking}
                    type="submit"
                    variant="flat"
                    startContent={<EditIcon />}
                >
                    Edit
                </GenericButton>
            </div>
        </form>
    );
};

export default EditStockTypeForm;