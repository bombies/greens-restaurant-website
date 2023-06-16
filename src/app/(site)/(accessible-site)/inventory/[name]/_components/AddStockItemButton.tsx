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

const AddItem = (inventoryName: string, name?: string) => {
    const mutator = (url: string) => axios.post(url, { name });
    return useSWRMutation(`/api/inventory/${inventoryName}/stock`, mutator);
};

type Props = {
    inventoryName: string,
    setCurrentData: Dispatch<SetStateAction<StockSnapshot[]>>
}

export default function AddStockItemButton({ inventoryName, setCurrentData }: Props) {
    const router = useRouter();
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
        if (!stockName)
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
    }, [stockName, triggerStockAdd]);

    const onSubmit: SubmitHandler<FieldValues> = (data) => {
        const { name } = data;
        setStockName(name);
    };

    return (
        <>
            <GenericButton
                shadow
                icon={addIcon}
                onClick={() => setModalOpen(true)}
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
                        id="name"
                        label="Item Name"
                        disabled={addingStock}
                        register={register}
                        errors={errors}
                        isRequired={true}
                    />
                    <Spacer y={4} />
                    <GenericButton
                        icon={addIcon}
                        shadow
                        type="submit"
                        loading={addingStock}
                        disabled={addingStock}
                    >Add Item</GenericButton>
                </form>
            </GenericModal>
        </>
    );
}