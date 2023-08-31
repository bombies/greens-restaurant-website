"use client";

import GenericModal from "../../../../_components/GenericModal";
import { useState } from "react";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import GenericButton from "../../../../_components/inputs/GenericButton";
import axios from "axios";
import useSWRMutation from "swr/mutation";
import { CreateInvoiceCustomerDto } from "../../../../api/invoices/customer/route";
import GenericInput from "../../../../_components/inputs/GenericInput";
import { Spacer } from "@nextui-org/react";
import GenericTextArea from "../../../../_components/inputs/GenericTextArea";
import PlusIcon from "../../../../_components/icons/PlusIcon";
import { toast } from "react-hot-toast";
import { errorToast } from "../../../../../utils/Hooks";
import { InvoiceCustomerWithOptionalItems } from "../../home/_components/widgets/invoice/InvoiceWidget";
import { KeyedMutator } from "swr";
import { InvoiceCustomer } from "@prisma/client";

type Props = {
    disabled?: boolean,
    customers?: InvoiceCustomerWithOptionalItems[]
    mutateData: KeyedMutator<InvoiceCustomerWithOptionalItems[] | undefined>
}

type CreateCustomerArgs = {
    arg: {
        dto: CreateInvoiceCustomerDto
    }
}

const CreateCustomer = () => {
    const mutator = (url: string, { arg }: CreateCustomerArgs) => axios.post(url, arg.dto);
    return useSWRMutation("/api/invoices/customer", mutator);
};

export default function CreateCustomerButton({ disabled, mutateData, customers }: Props) {
    const [modalOpen, setModalOpen] = useState(false);
    const { register, handleSubmit, formState: { errors } } = useForm<FieldValues>();
    const { trigger: triggerCustomerCreation, isMutating: customerIsCreating } = CreateCustomer();

    const onSubmit: SubmitHandler<FieldValues> = (data) => {
        triggerCustomerCreation({
            dto: {
                customerName: data.customerName,
                customerAddress: data.customerAddress || null,
                customerEmail: data.customerEmail,
                customerDescription: data.customerDescription
            }
        }).then(async (res) => {
            const createdCustomer: InvoiceCustomer = res.data;
            await mutateData(customers ? [...customers, createdCustomer] : [createdCustomer]);
            toast.success("Successfully created that customer!");
            setModalOpen(false);
        })
            .catch(e => {
                errorToast(e, "Could not create that customer!");
            });
    };

    return (
        <>
            <GenericModal
                title="Add a Customer"
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
            >
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="flex gap-6">
                        <GenericInput
                            id="customerName"
                            register={register}
                            label="Customer Name"
                            isRequired
                            isDisabled={customerIsCreating || disabled}
                            isClearable
                            maxLength={30}
                            placeholder="Enter the name of the customer"
                        />
                        <GenericInput
                            id="customerEmail"
                            register={register}
                            label="Email"
                            isDisabled={customerIsCreating || disabled}
                            type="email"
                            isClearable
                            placeholder="Enter the email address of the customer"
                        />
                    </div>
                    <Spacer y={6} />
                    <GenericTextArea
                        id="customerAddress"
                        register={register}
                        label="Address"
                        isDisabled={customerIsCreating || disabled}
                        isClearable
                        placeholder="Enter the address of the customer"
                    />
                    <Spacer y={6} />
                    <GenericTextArea
                        id="customerDescription"
                        register={register}
                        label="Description"
                        isDisabled={customerIsCreating || disabled}
                        isClearable
                        placeholder="Enter a description of the customer"
                    />
                    <Spacer y={6} />
                    <GenericButton
                        isLoading={customerIsCreating}
                        isDisabled={customerIsCreating || disabled}
                        type="submit"
                    >
                        Create Customer
                    </GenericButton>
                </form>
            </GenericModal>
            <GenericButton
                variant="flat"
                disabled={disabled || customerIsCreating}
                isLoading={customerIsCreating}
                startContent={<PlusIcon fill="#00D615" />}
                onPress={() => setModalOpen(true)}
            >
                Add Customer
            </GenericButton>
        </>
    );
}