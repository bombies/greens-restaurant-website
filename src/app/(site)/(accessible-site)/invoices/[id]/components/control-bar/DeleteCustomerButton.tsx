"use client";

import { useState } from "react";
import ConfirmationModal from "../../../../../../_components/ConfirmationModal";
import { InvoiceCustomer } from "@prisma/client";
import "../../../../../../../utils/GeneralUtils";
import GenericButton from "../../../../../../_components/inputs/GenericButton";
import axios from "axios";
import useSWRMutation from "swr/mutation";
import { useRouter } from "next/navigation";
import IconButton from "../../../../../../_components/inputs/IconButton";
import { toast } from "react-hot-toast";
import { errorToast } from "../../../../../../../utils/Hooks";
import TrashIcon from "../../../../../../_components/icons/TrashIcon";

type Props = {
    customer?: InvoiceCustomer,
    disabled?: boolean,
    iconOnly?: boolean,
    onSuccess?: (data: InvoiceCustomer) => void,
    noReroute?: boolean,
}

const DeleteCustomer = (customerId?: string) => {
    const mutator = (url: string) => axios.delete(url);
    return useSWRMutation(`/api/invoices/customer/${customerId}`, mutator);
};

export default function DeleteCustomerButton({ customer, disabled, iconOnly, onSuccess, noReroute }: Props) {
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
                        .then((data) => {
                            toast.success(`You have successfully deleted ${customer?.customerName.capitalize()}!`);

                            if (!noReroute)
                                router.push(`/invoices`);

                            if (onSuccess)
                                onSuccess(data.data);
                        })
                        .catch(e => {
                            console.error(e);
                            errorToast(e, "There was an error deleting this customer!");
                        });
                }}
            />
            {
                iconOnly ?
                    <IconButton
                        toolTip="Delete"
                        variant="flat"
                        color="danger"
                        onPress={() => setModalOpen(true)}
                    >
                        <TrashIcon />
                    </IconButton>
                    :
                    <GenericButton
                        disabled={disabled}
                        color="danger"
                        variant="flat"
                        onPress={() => setModalOpen(true)}
                        startContent={<TrashIcon />}
                    >
                        Delete {customer?.customerName.capitalize()}
                    </GenericButton>
            }
        </>
    );
}