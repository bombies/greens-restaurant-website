"use client";

import GenericButton from "../../../../../../_components/inputs/GenericButton";
import axios from "axios";
import useSWRMutation from "swr/mutation";
import invoiceIcon from "/public/icons/invoice.svg";
import { toast } from "react-hot-toast";
import { errorToast } from "../../../../../../../utils/Hooks";
import { KeyedMutator } from "swr";
import {
    InvoiceCustomerWithOptionalItems,
    InvoiceWithOptionalItems
} from "../../../../home/_components/widgets/invoice/InvoiceWidget";

type Props = {
    disabled?: boolean,
    customer?: InvoiceCustomerWithOptionalItems,
    mutator: KeyedMutator<InvoiceCustomerWithOptionalItems | undefined>,
}

const CreateInvoice = (customerId?: string) => {
    const mutator = (url: string) => axios.post(url);
    return useSWRMutation(`/api/invoices/customer/${customerId}/invoices`, mutator);
};

export default function CreateInvoiceButton({ customer, disabled, mutator }: Props) {
    const { trigger: triggerInvoiceCreation, isMutating: invoiceIsCreating } = CreateInvoice(customer?.id);

    return (
        <>
            <GenericButton
                isLoading={invoiceIsCreating}
                disabled={disabled || invoiceIsCreating}
                icon={invoiceIcon}
                onPress={() => triggerInvoiceCreation()
                    .then(async (res) => {
                        const createdInvoice: InvoiceWithOptionalItems = res.data;
                        await mutator({
                            ...customer,
                            invoices: customer?.invoices ? [
                                ...customer.invoices,
                                createdInvoice
                            ] : [createdInvoice]
                        });
                        toast.success("You have successfully created a new invoice!");
                    })
                    .catch(e => {
                        console.error(e);
                        errorToast(e, "There was an error creating a new invoice!");
                    })
                }
            >
                New Invoice
            </GenericButton>
        </>
    );
}