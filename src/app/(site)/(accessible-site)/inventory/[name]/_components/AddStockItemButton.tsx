"use client";

import GenericButton from "../../../../../_components/inputs/GenericButton";
import addIcon from "/public/icons/add.svg";
import { Dispatch, SetStateAction, useState } from "react";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import GenericModal from "../../../../../_components/GenericModal";
import GenericInput from "../../../../../_components/inputs/GenericInput";
import { Spacer } from "@nextui-org/react";
import axios from "axios";
import useSWRMutation from "swr/mutation";
import { sendToast } from "../../../../../../utils/Hooks";
import { StockSnapshot } from "@prisma/client";

type AddItemProps = {
    arg: {
        name: string,
    }
}

const AddItem = (inventoryName: string) => {
    const mutator = (url: string, { arg }: AddItemProps) => {
        return axios.post(url, { name: arg.name });
    };
    return useSWRMutation(`/api/inventory/${inventoryName}/stock`, mutator);
};

type Props = {
    inventoryName: string,
    setCurrentData: Dispatch<SetStateAction<StockSnapshot[]>>
    disabled?: boolean
}

export default function AddStockItemButton({ inventoryName, setCurrentData, disabled }: Props) {
    const [modalOpen, setModalOpen] = useState(false);
    const { trigger: triggerStockAdd, isMutating: addingStock } = AddItem(inventoryName);
    const {
        register,
        handleSubmit,
        formState: {
            errors
        }
    } = useForm<FieldValues>();

    const onSubmit: SubmitHandler<FieldValues> = (data) => {
        const { name } = data;
        triggerStockAdd({ name })
            .then(stock => {
                sendToast({
                    description: "Successfully created that item"
                }, {
                    position: "top-center"
                });
                setCurrentData(prev => [
                    ...prev,
                    {
                        ...stock?.data,
                        quantity: 0
                    }
                ]);
                setModalOpen(false);
            })
            .catch(e => {
                console.error(e);
                sendToast({
                    error: e,
                    description: "Could not create that item!" // Fallback
                }, {
                    position: "top-center"

                });
            });
    };

    return (
        <>
            <GenericButton
                fullWidth
                disabled={disabled}
                icon={addIcon}
                onPress={() => setModalOpen(true)}
            >
                Add Item
            </GenericButton>
            <GenericModal
                title="Add Item"
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
            >
                <form onSubmit={handleSubmit(onSubmit)}>
                    <GenericInput
                        isDisabled={disabled || addingStock}
                        id="name"
                        label="Item Name"
                        register={register}
                        errors={errors}
                        isRequired={true}
                    />
                    <Spacer y={4} />
                    <GenericButton
                        icon={addIcon}
                        type="submit"
                        isLoading={addingStock}
                        disabled={addingStock || disabled}
                    >Add Item</GenericButton>
                </form>
            </GenericModal>
        </>
    );
}