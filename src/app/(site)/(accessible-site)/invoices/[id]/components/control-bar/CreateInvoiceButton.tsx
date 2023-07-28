"use client";

import GenericButton from "../../../../../../_components/inputs/GenericButton";
import axios from "axios";
import useSWRMutation from "swr/mutation";
import { sendToast } from "../../../../../../../utils/Hooks";
import invoiceIcon from "/public/icons/invoice.svg";

type Props = {
    customerId?: string,
    disabled?: boolean
}

const CreateInvoice = (customerId?: string) => {
    const mutator = (url: string) => axios.post(url);
    return useSWRMutation(`/api/invoices/customer/${customerId}/invoices`, mutator);
};

export default function CreateInvoiceButton({ customerId, disabled }: Props) {
    const { trigger: triggerInvoiceCreation, isMutating: invoiceIsCreating } = CreateInvoice(customerId);

    return (
        <>
            <GenericButton
                isLoading={invoiceIsCreating}
                disabled={disabled || invoiceIsCreating}
                icon={invoiceIcon}
                onPress={() => triggerInvoiceCreation()
                    .then(() => {
                        sendToast({
                            description: "You have successfully created a new invoice!"
                        });
                    })
                    .catch(e => {
                        console.error(e);
                        sendToast({
                            error: e,
                            description: "There was an error creating a new invoice!"
                        });
                    })
                }
            >
                New Invoice
            </GenericButton>
        </>
    );
}