"use client";

import GenericButton from "../../../../../../../_components/inputs/GenericButton";
import { InvoiceItem } from "@prisma/client";
import {
    UpdateInvoiceItemDto
} from "../../../../../../../api/invoices/customer/[id]/invoice/[invoiceId]/[itemId]/types";
import { Dispatch, SetStateAction, useReducer, useState } from "react";
import GenericModal from "../../../../../../../_components/GenericModal";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { SWRArgs } from "../../../../../employees/_components/EmployeeGrid";
import useSWRMutation from "swr/mutation";
import axios from "axios";
import GenericInput from "../../../../../../../_components/inputs/GenericInput";
import { InvoiceItemChangeAction } from "../InvoiceItemsProvider";
import editIcon from "/public/icons/edit-green.svg";
import { toast } from "react-hot-toast";
import { errorToast } from "../../../../../../../../utils/Hooks";

type Props = {
    disabled: boolean,
    customerId?: string,
    item: InvoiceItem,
    dispatchItems: Dispatch<{
        type: InvoiceItemChangeAction,
        payload?: ({ id: string } & UpdateInvoiceItemDto) | undefined
    }>,
    setSelectedKeys: Dispatch<SetStateAction<string[]>>
}

enum EditItemAction {
    UPDATE
}

const reducer = (state: InvoiceItem, action: { type: EditItemAction, payload: UpdateInvoiceItemDto }) => {
    let newState = { ...state };

    switch (action.type) {
        case EditItemAction.UPDATE: {
            newState = {
                ...newState,
                ...action.payload
            };
            break;
        }
    }

    return newState;
};

interface UpdateInvoiceItemArgs extends SWRArgs {
    arg: {
        dto: UpdateInvoiceItemDto
    };
}

const UpdateInvoiceItem = (customerId?: string, invoiceId?: string, invoiceItemId?: string) => {
    const mutator = (url: string, { arg }: UpdateInvoiceItemArgs) => axios.patch(url, arg.dto);
    return useSWRMutation(`/api/invoices/customer/${customerId}/invoice/${invoiceId}/${invoiceItemId}`, mutator);
};

export default function EditInvoiceItemButton({ customerId, item, dispatchItems, setSelectedKeys, disabled }: Props) {
    const [currentInfo, dispatchCurrentInfo] = useReducer(reducer, item);
    const [modalOpen, setModalOpen] = useState(false);
    const {
        trigger: triggerInvoiceItemUpdate,
        isMutating: itemIsUpdating
    } = UpdateInvoiceItem(customerId, item.invoiceId, item.id);
    const { register, handleSubmit, formState: { errors } } = useForm<FieldValues>();

    const onSubmit: SubmitHandler<FieldValues> = (data) => {
        triggerInvoiceItemUpdate({
            dto: {
                name: data.name || undefined,
                description: data.description || undefined,
                quantity: data.quantity !== undefined ? Number(data.quantity) : undefined,
                price: data.price !== undefined ? Number(data.price) : undefined
            }
        })
            .then((data) => {
                dispatchItems({
                    type: InvoiceItemChangeAction.UPDATE,
                    payload: {
                        ...data.data
                    }
                });
                setSelectedKeys([]);
                toast.success("Successfully updated that item!");
                setModalOpen(false);
            })
            .catch(e => {
                console.error(e);
                errorToast(e, "There was an error updating this item!");
            });
    };

    return (
        <>
            <GenericModal
                classNames={{
                    wrapper: "z-[202]",
                    backdrop: "z-[201]"
                }}
                title={`Edit ${item.name}`}
                isOpen={modalOpen}
                onClose={() => {
                    setModalOpen(false);
                }}
            >
                <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                    <GenericInput
                        disabled={itemIsUpdating || disabled}
                        register={register}
                        errors={errors}
                        id="name"
                        label="Item Name"
                        placeholder="Enter the name of the item"
                        labelPlacement="outside"
                        value={currentInfo.name}
                        onValueChange={(value: string | undefined) => dispatchCurrentInfo({
                            type: EditItemAction.UPDATE,
                            payload: { name: value }
                        })}
                    />
                    <GenericInput
                        disabled={itemIsUpdating || disabled}
                        register={register}
                        errors={errors}
                        id="description"
                        label="Item Description"
                        placeholder="Enter the description of the item"
                        labelPlacement="outside"
                        value={currentInfo.description}
                        onValueChange={(value: string | undefined) => dispatchCurrentInfo({
                            type: EditItemAction.UPDATE,
                            payload: { description: value }
                        })}
                    />
                    <div className="flex phone:flex-col gap-6">
                        <GenericInput
                            disabled={itemIsUpdating || disabled}
                            register={register}
                            errors={errors}
                            id="quantity"
                            label="Item Quantity"
                            placeholder="Enter the quantity of the item"
                            value={currentInfo.quantity.toString()}
                            onValueChange={(value: string | undefined) => dispatchCurrentInfo({
                                type: EditItemAction.UPDATE,
                                payload: { quantity: Number(value) }
                            })}
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
                            disabled={itemIsUpdating || disabled}
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
                            value={currentInfo.price.toString()}
                            onValueChange={(value: string | undefined) => dispatchCurrentInfo({
                                type: EditItemAction.UPDATE,
                                payload: { price: Number(value) }
                            })}
                            type="number"
                            min={0}
                            labelPlacement="outside"
                        />
                    </div>
                    <GenericButton
                        isLoading={itemIsUpdating || disabled}
                        variant="flat"
                        type="submit"
                        icon={editIcon}
                    >
                        Edit Item
                    </GenericButton>
                </form>
            </GenericModal>
            <GenericButton
                disabled={disabled}
                variant="flat"
                onPress={() => {
                    setModalOpen(true);
                }}
                icon={editIcon}
            >Edit</GenericButton>
        </>
    );
}