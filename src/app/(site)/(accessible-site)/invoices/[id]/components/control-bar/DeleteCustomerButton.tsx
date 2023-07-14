"use client";

import { useState } from "react";
import ConfirmationModal from "../../../../../../_components/ConfirmationModal";
import { InvoiceCustomer } from "@prisma/client";
import "../../../../../../../utils/GeneralUtils";
import GenericButton from "../../../../../../_components/inputs/GenericButton";
import axios from "axios";
import useSWRMutation from "swr/mutation";
import { useRouter } from "next/navigation";
import { sendToast } from "../../../../../../../utils/Hooks";
import trashIcon from "/public/icons/red-trash.svg";

type Props = {
    customer?: InvoiceCustomer,
    disabled?: boolean
}

const DeleteCustomer = (customerId?: string) => {
    const mutator = (url: string) => axios.delete(url);
    return useSWRMutation(`/api/invoices/customer/${customerId}`, mutator);
};

export default function DeleteCustomerButton({ customer, disabled }: Props) {
    const [modalOpen, setModalOpen] = useState(false);
    const { trigger: triggerCustomerDeletion, isMutating: customerIsDeleting } = DeleteCustomer(customer?.id);
    const router = useRouter();

    return (
        <>
            <ConfirmationModal
                isOpen={modalOpen}
                setOpen={setModalOpen}
                accepting={customerIsDeleting}
                title="Delete Customer"
                message={`Are you sure you want to delete ${customer?.customerName.capitalize()}`}
                onAccept={() => {
                    triggerCustomerDeletion()
                        .then(() => {
                            sendToast({
                                description: `You have successfully deleted that ${customer?.customerName.capitalize()}!`
                            });
                            router.push(`/invoices`);
                        })
                        .catch(e => {
                            console.error(e);
                            sendToast({
                                error: e,
                                description: "There was an error deleting this customer!"
                            });
                        });
                }}
            />
            <GenericButton
                disabled={disabled}
                color="danger"
                variant="flat"
                onPress={() => setModalOpen(true)}
                icon={trashIcon}
            >
                Delete {customer?.customerName.capitalize()}
            </GenericButton>
        </>
    );
}