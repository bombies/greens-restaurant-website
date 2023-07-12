"use client";

import GenericButton from "../../../../../../_components/inputs/GenericButton";
import { useState } from "react";
import GenericModal from "../../../../../../_components/GenericModal";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import GenericInput from "../../../../../../_components/inputs/GenericInput";
import { Spacer } from "@nextui-org/react";
import axios from "axios";
import { CreateInvoiceDto } from "../../../../../../api/invoices/customer/[id]/invoices/route";
import useSWRMutation from "swr/mutation";
import { sendToast } from "../../../../../../../utils/Hooks";
import invoiceIcon from "/public/icons/invoice.svg";

type Props = {
    customerId?: string,
    disabled?: boolean
}

type CreateInvoiceArgs = {
    arg: {
        dto: CreateInvoiceDto
    }
}

const CreateInvoice = (customerId?: string) => {
    const mutator = (url: string, { arg }: CreateInvoiceArgs) => axios.post(url, arg.dto);
    return useSWRMutation(`/api/invoices/customer/${customerId}/invoices`, mutator);
};

export default function CreateInvoiceButton({ customerId, disabled }: Props) {
    const [modalOpen, setModalOpen] = useState(false);
    const { register, handleSubmit, formState: { errors } } = useForm<FieldValues>();
    const { trigger: triggerInvoiceCreation, isMutating: invoiceIsCreating } = CreateInvoice(customerId);

    const onSubmit: SubmitHandler<FieldValues> = (data) => {
        triggerInvoiceCreation({
            dto: {
                title: data.invoiceTitle,
                description: data.invoiceDesc
            }
        })
            .then(() => {
                setModalOpen(false);
                sendToast({
                    description: "You have successfully created that invoice!"
                });
            })
            .catch(e => {
                console.error(e);
                sendToast({
                    error: e,
                    description: "There was an error creating this invoice!"
                });
            });
    };

    return (
        <>
            <GenericModal
                title="Create A New Invoice"
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
            >
                <form onSubmit={handleSubmit(onSubmit)}>
                    <GenericInput
                        disabled={disabled || invoiceIsCreating}
                        id="invoiceTitle"
                        register={register}
                        label="Invoice Title"
                        placeholder="Enter a title for this invoice"
                        isRequired
                    />
                    <Spacer y={6} />
                    <GenericInput
                        disabled={disabled || invoiceIsCreating}
                        id="invoiceDesc"
                        register={register}
                        label="Invoice Description"
                        placeholder="Enter a description for this invoice"
                    />
                    <Spacer y={6} />
                    <div className="flex gap-6">
                        <GenericButton
                            type="submit"
                            disabled={disabled || invoiceIsCreating}
                            isLoading={invoiceIsCreating}
                        >
                            Let&apos;s Start Billing!
                        </GenericButton>
                        <GenericButton
                            variant="flat"
                            color="danger"
                            onPress={() => setModalOpen(false)}
                        >
                            Never mind
                        </GenericButton>
                    </div>
                </form>
            </GenericModal>
            <GenericButton
                disabled={disabled}
                icon={invoiceIcon}
                onPress={() => setModalOpen(true)}
            >
                New Invoice
            </GenericButton>
        </>
    );
}