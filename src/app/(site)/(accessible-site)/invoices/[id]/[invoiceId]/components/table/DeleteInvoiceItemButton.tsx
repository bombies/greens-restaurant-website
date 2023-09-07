"use client";

import GenericButton from "../../../../../../../_components/inputs/GenericButton";
import { InvoiceItem } from "@prisma/client";
import ConfirmationModal from "../../../../../../../_components/ConfirmationModal";
import { Dispatch, Key, SetStateAction, useState } from "react";
import axios from "axios";
import useSWRMutation from "swr/mutation";
import { InvoiceItemChangeAction } from "../InvoiceItemsProvider";
import { toast } from "react-hot-toast";
import { errorToast } from "../../../../../../../../utils/Hooks";
import TrashIcon from "../../../../../../../_components/icons/TrashIcon";

type Props = {
    disabled: boolean,
    customerId?: string,
    item: InvoiceItem,
    dispatchItems: Dispatch<{
        type: InvoiceItemChangeAction,
        payload?: { id: string } | undefined
    }>,
    setSelectedKeys: Dispatch<SetStateAction<Key[]>>
}

const DeleteItem = (customerId?: string, invoiceId?: string, invoiceItemId?: string) => {
    const mutator = (url: string) => axios.delete(url);
    return useSWRMutation(`/api/invoices/customer/${customerId}/invoice/${invoiceId}/${invoiceItemId}`, mutator);
};

export default function DeleteInvoiceItemButton({ customerId, item, setSelectedKeys, dispatchItems, disabled }: Props) {
    const [modalOpen, setModalOpen] = useState(false);
    const {
        trigger: triggerItemDeletion,
        isMutating: itemIsDeleting
    } = DeleteItem(customerId, item.invoiceId, item.id);

    return (
        <>
            <ConfirmationModal
                isOpen={modalOpen}
                setOpen={setModalOpen}
                accepting={itemIsDeleting}
                title={`Delete ${item.name}`}
                message={`Are you sure you want to delete ${item.name}`}
                onAccept={() => {
                    if (disabled)
                        return;

                    triggerItemDeletion()
                        .then((data) => {
                            dispatchItems({
                                type: InvoiceItemChangeAction.REMOVE,
                                payload: { id: data.data.id }
                            });
                            setSelectedKeys([]);
                            toast.success(`Successfully deleted ${data.data.name}!`);
                            setModalOpen(false);
                        })
                        .catch(e => {
                            console.error(e);
                            errorToast(e, "There was an error deleting this item!");
                        });
                }}
            />
            <GenericButton
                disabled={disabled}
                variant="flat"
                color="danger"
                onPress={() => setModalOpen(true)}
                startContent={<TrashIcon />}
            >Delete</GenericButton>
        </>
    );
}