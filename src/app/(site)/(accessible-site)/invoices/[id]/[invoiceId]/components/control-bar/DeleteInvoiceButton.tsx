"use client";

import GenericButton from "../../../../../../../_components/inputs/GenericButton";
import { Invoice } from "@prisma/client";
import axios from "axios";
import useSWRMutation from "swr/mutation";
import ConfirmationModal from "../../../../../../../_components/ConfirmationModal";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { errorToast } from "../../../../../../../../utils/Hooks";
import trashIcon from "/public/icons/red-trash.svg";
import { toast } from "react-hot-toast";

type Props = {
    customerId?: string
    invoice?: Invoice
    disabled: boolean
}

const DeleteInvoice = (customerId?: string, invoiceId?: string) => {
    const mutator = (url: string) => axios.delete(url);
    return useSWRMutation(` /api/invoices/customer/${customerId}/invoice/${invoiceId}`, mutator);
};

export default function DeleteInvoiceButton({ customerId, invoice, disabled }: Props) {
    const { trigger: triggerDeletion, isMutating: isDeleting } = DeleteInvoice(customerId, invoice?.id);
    const [modalOpen, setModalOpen] = useState(false);
    const router = useRouter();

    return (
        <>
            <ConfirmationModal
                isOpen={modalOpen}
                setOpen={setModalOpen}
                accepting={isDeleting}
                title="Delete Invoice"
                message="Are you sure you want to delete this invoice?"
                onAccept={() => {
                    triggerDeletion()
                        .then(() => {
                            toast.success("You have successfully deleted that invoice!");
                            router.push(`/invoices/${customerId}`);
                        })
                        .catch(e => {
                            console.error(e);
                            errorToast(e, "There was an error deleting this invoice!");
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
                Delete Invoice
            </GenericButton>
        </>
    );

}