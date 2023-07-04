"use client";

import GenericButton from "../../../../../_components/inputs/GenericButton";
import addIcon from "/public/icons/add.svg";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import GenericModal from "../../../../../_components/GenericModal";
import GenericInput from "../../../../../_components/inputs/GenericInput";
import { Spacer } from "@nextui-org/react";
import axios from "axios";
import useSWRMutation from "swr/mutation";
import { sendToast } from "../../../../../../utils/Hooks";
import { useRouter } from "next/navigation";
import { StockSnapshot } from "@prisma/client";
import { add } from "@internationalized/date/src/manipulation";

const AddItem = (inventoryName: string, name?: string) => {
    const mutator = (url: string) => axios.post(url, { name });
    return useSWRMutation(`/api/inventory/${inventoryName}/stock`, mutator);
};

type Props = {
    inventoryName: string,
    setCurrentData: Dispatch<SetStateAction<StockSnapshot[]>>
    disabled?: boolean
}

export default function AddStockItemButton({ inventoryName, setCurrentData, disabled }: Props) {
    const [modalOpen, setModalOpen] = useState(false);
    const [stockName, setStockName] = useState<string>();
    const { trigger: triggerStockAdd, isMutating: addingStock } = AddItem(inventoryName, stockName);
    const {
        register,
        handleSubmit,
        formState: {
            errors
        }
    } = useForm<FieldValues>();

    useEffect(() => {
        if (!stockName || disabled || addingStock)
            return;

        triggerStockAdd()
            .then(stock => {
                sendToast({
                    description: "Successfully created that item"
                }, {
                    position: "top-center"
                });
                setModalOpen(false);

                setCurrentData(prev => [
                    ...prev,
                    {
                        ...stock?.data,
                        quantity: 0
                    }
                ]);
            })
            .catch(e => {
                sendToast({
                    error: e,
                    description: "Could not create that item!" // Fallback
                }, {
                    position: "top-center"
                });
                setStockName(undefined);
            });
    }, [addingStock, disabled, setCurrentData, stockName, triggerStockAdd]);

    const onSubmit: SubmitHandler<FieldValues> = (data) => {
        const { name } = data;
        setStockName(name);
    };

    return (
        <>
            <GenericButton
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