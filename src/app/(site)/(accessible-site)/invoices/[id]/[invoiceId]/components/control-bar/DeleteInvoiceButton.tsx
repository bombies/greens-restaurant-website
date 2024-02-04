"use client";

import GenericButton from "../../../../../../../_components/inputs/GenericButton";
import { Invoice } from "@prisma/client";
import axios from "axios";
import useSWRMutation from "swr/mutation";
import ConfirmationModal from "../../../../../../../_components/ConfirmationModal";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { errorToast } from "../../../../../../../../utils/Hooks";
import { toast } from "react-hot-toast";
import TrashIcon from "../../../../../../../_components/icons/TrashIcon";
import { invoiceTypeAsString } from "../../../../utils";

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
                title={`Delete ${invoiceTypeAsString(invoice)}`}
                message={`Are you sure you want to delete this ${invoiceTypeAsString(invoice).toLowerCase()}?`}
                onAccept={() => {
                    triggerDeletion()
                        .then(() => {
                            toast.success(`You have successfully deleted that ${invoiceTypeAsString(invoice).toLowerCase()}!`);
                            router.push(`/invoices/${customerId}`);
                        })
                        .catch(e => {
                            console.error(e);
                            errorToast(e, `There was an error deleting this ${invoiceTypeAsString(invoice).toLowerCase()}!`);
                        });
                }}
            />
            <GenericButton
                disabled={disabled}
                color="danger"
                variant="flat"
                onPress={() => setModalOpen(true)}
                startContent={<TrashIcon />}
            >
                Delete {invoiceTypeAsString(invoice)}
            </GenericButton>
        </>
    );

}