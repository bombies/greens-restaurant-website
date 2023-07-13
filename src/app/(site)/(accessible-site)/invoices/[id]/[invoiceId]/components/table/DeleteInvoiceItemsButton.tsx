"use client";

import { InvoiceItem } from "@prisma/client";
import { Dispatch, Key, SetStateAction, useState } from "react";
import { InvoiceItemChangeAction } from "../InvoiceItemsProvider";
import useSWRMutation from "swr/mutation";
import {
    DeleteManyInvoiceItemsDto
} from "../../../../../../../api/invoices/customer/[id]/invoice/[invoiceId]/items/route";
import ConfirmationModal from "../../../../../../../_components/ConfirmationModal";
import { sendToast } from "../../../../../../../../utils/Hooks";
import GenericButton from "../../../../../../../_components/inputs/GenericButton";
import axios from "axios";

type Props = {
    disabled: boolean,
    customerId?: string,
    items: InvoiceItem[],
    dispatchItems: Dispatch<{
        type: InvoiceItemChangeAction,
        payload?: string[] | undefined
    }>,
    setSelectedKeys: Dispatch<SetStateAction<Key[]>>
}

interface DeleteItemArgs {
    arg: {
        dto: DeleteManyInvoiceItemsDto
    };
}

const DeleteItems = (customerId?: string, invoiceId?: string) => {
    const mutator = (url: string, { arg }: DeleteItemArgs) => axios.delete(url, {
        data: arg.dto
    });
    return useSWRMutation(`/api/invoices/customer/${customerId}/invoice/${invoiceId}/items`, mutator);
};

export default function DeleteInvoiceItemsButton({
                                                     customerId,
                                                     items,
                                                     setSelectedKeys,
                                                     dispatchItems,
                                                     disabled
                                                 }: Props) {
    const [modalOpen, setModalOpen] = useState(false);
    const {
        trigger: triggerItemDeletion,
        isMutating: itemIsDeleting
    } = DeleteItems(customerId, items[0]?.invoiceId);

    return (
        <>
            <ConfirmationModal
                isOpen={modalOpen}
                setOpen={setModalOpen}
                accepting={itemIsDeleting}
                title={`Delete Items`}
                message={`Are you sure you want to delete all ${items.length} items?`}
                onAccept={() => {
                    if (disabled)
                        return;

                    triggerItemDeletion({
                        dto: {
                            itemsToDelete: items.map(item => item.id)
                        }
                    })
                        .then(() => {
                            dispatchItems({
                                type: InvoiceItemChangeAction.REMOVE_MANY,
                                payload: items.map(item => item.id)
                            });
                            setSelectedKeys([]);
                            sendToast({
                                description: `Successfully deleted those items!`
                            });
                            setModalOpen(false);
                        })
                        .catch(e => {
                            console.error(e);
                            sendToast({
                                error: e,
                                description: "There was an error deleting these items!"
                            });
                        });
                }}
            />
            <GenericButton
                disabled={disabled}
                variant="flat"
                color="danger"
                onPress={() => setModalOpen(true)}
            >Delete Items</GenericButton>
        </>
    );
}