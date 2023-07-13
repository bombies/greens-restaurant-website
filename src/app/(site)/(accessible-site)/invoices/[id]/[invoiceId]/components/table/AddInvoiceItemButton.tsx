"use client";

import addIcon from "/public/icons/add.svg";
import IconButton from "../../../../../../../_components/inputs/IconButton";
import { useState } from "react";
import GenericModal from "../../../../../../../_components/GenericModal";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import GenericInput from "../../../../../../../_components/inputs/GenericInput";
import GenericButton from "../../../../../../../_components/inputs/GenericButton";
import { CreateInvoiceItemsDto } from "../../../../../../../api/invoices/customer/[id]/invoice/[invoiceId]/route";
import axios from "axios";
import useSWRMutation from "swr/mutation";
import { sendToast } from "../../../../../../../../utils/Hooks";

type AddInvoiceItemArgs = {
    arg: {
        dto: CreateInvoiceItemsDto
    }
}

const AddInvoiceItem = (customerId?: string, invoiceId?: string) => {
    const mutator = (url: string, { arg }: AddInvoiceItemArgs) => axios.post(url, arg.dto);
    return useSWRMutation(`/api/invoices/customer/${customerId}/invoice/${invoiceId}`, mutator);
};

type Props = {
    customerId?: string,
    invoiceId?: string,
    disabled: boolean,
}

export default function AddInvoiceItemButton({ customerId, invoiceId, disabled }: Props) {
    const [modalOpen, setModalOpen] = useState(false);
    const { register, handleSubmit, formState: { errors } } = useForm<FieldValues>();
    const { trigger: triggerItemAdd, isMutating: itemIsAdding } = AddInvoiceItem(customerId, invoiceId);

    const onSubmit: SubmitHandler<FieldValues> = (data) => {
        const validQuantity = Math.floor(Math.max(0, data.quantity));
        const validPrice = Math.max(0, data.price);

        if (!invoiceId)
            return;

        triggerItemAdd({
            dto: [{
                name: data.name,
                description: data.description,
                quantity: validQuantity,
                price: validPrice,
                invoiceId: invoiceId
            }]
        })
            .then(() => {
                setModalOpen(false);
                sendToast({
                    description: "Successfully added that item!"
                });
            })
            .catch(e => {
                console.error(e);
                sendToast({
                    error: e,
                    description: "There was an error adding that item!"
                });
            });
    };

    return (
        <>
            <GenericModal
                title="Add A New Item"
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
            >
                <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                    <GenericInput
                        disabled={itemIsAdding || disabled}
                        register={register}
                        errors={errors}
                        id="name"
                        label="Item Name"
                        placeholder="Enter the name of the item"
                        isRequired
                        labelPlacement="outside"
                    />
                    <GenericInput
                        disabled={itemIsAdding || disabled}
                        register={register}
                        errors={errors}
                        id="description"
                        label="Item Description"
                        placeholder="Enter the description of the item"
                        labelPlacement="outside"
                    />
                    <div className="flex phone:flex-col gap-6">
                        <GenericInput
                            disabled={itemIsAdding || disabled}
                            register={register}
                            errors={errors}
                            id="quantity"
                            label="Item Quantity"
                            placeholder="Enter the quantity of the item"
                            isRequired
                            endContent={
                                <div className="pointer-events-none flex items-center">
                                    <span className="text-default-400 text-small">#</span>
                                </div>
                            }
                            type="number"
                            min={0}
                            labelPlacement="outside"
                        />
                        <GenericInput
                            disabled={itemIsAdding || disabled}
                            register={register}
                            errors={errors}
                            id="price"
                            label="Item Price"
                            placeholder="0.00"
                            startContent={
                                <div className="pointer-events-none flex items-center">
                                    <span className="text-default-400 text-small">$</span>
                                </div>
                            }
                            isRequired
                            type="number"
                            min={0}
                            labelPlacement="outside"
                        />
                    </div>
                    <GenericButton
                        variant="flat"
                        type="submit"
                        disabled={itemIsAdding || disabled}
                        isLoading={itemIsAdding}
                    >
                        Add Item
                    </GenericButton>
                </form>
            </GenericModal>
            <IconButton
                disabled={itemIsAdding || disabled}
                isLoading={itemIsAdding}
                variant="shadow"
                toolTip="New Item"
                icon={addIcon}
                onPress={() => setModalOpen(true)}
            />
        </>
    );
}