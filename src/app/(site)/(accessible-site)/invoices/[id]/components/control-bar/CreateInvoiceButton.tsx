"use client";

import useSWRMutation from "swr/mutation";
import { toast } from "react-hot-toast";
import { errorToast } from "../../../../../../../utils/Hooks";
import { KeyedMutator } from "swr";
import {
    InvoiceCustomerWithOptionalItems
} from "../../../../home/_components/widgets/invoice/InvoiceWidget";
import GenericDropdown from "../../../../../../_components/GenericDropdown";
import { useCallback } from "react";
import { Invoice, InvoiceType } from "@prisma/client";
import { $post } from "../../../../../../../utils/swr-utils";
import { CreateInvoiceDto } from "../../../../../../api/invoices/customer/[id]/invoices/types";
import { Button, DropdownItem } from "@nextui-org/react";
import InvoiceIcon from "../../../../../../_components/icons/InvoiceIcon";

type Props = {
    disabled?: boolean,
    customer?: InvoiceCustomerWithOptionalItems,
    mutator: KeyedMutator<InvoiceCustomerWithOptionalItems | undefined>,
}

const CreateInvoice = (customerId?: string) =>
    useSWRMutation(`/api/invoices/customer/${customerId}/invoices`, $post<CreateInvoiceDto, Invoice | null>());


export default function CreateInvoiceButton({ customer, disabled, mutator }: Props) {
    const { trigger: triggerInvoiceCreation, isMutating: invoiceIsCreating } = CreateInvoice(customer?.id);

    const createInvoice = useCallback((type: InvoiceType = InvoiceType.DEFAULT) => {
        triggerInvoiceCreation({
            body: { type }
        })
            .then(async (createdInvoice) => {
                if (!customer || !createdInvoice)
                    return;

                await mutator({
                    ...customer,
                    invoices: customer.invoices ? [
                        ...customer.invoices,
                        createdInvoice
                    ] : [createdInvoice]
                });
                toast.success("You have successfully created a new invoice!");
            })
            .catch(e => {
                console.error(e);
                errorToast(e, "There was an error creating a new invoice!");
            });
    }, [customer, mutator, triggerInvoiceCreation]);

    return (
        <>
            <GenericDropdown
                closeOnSelect
                trigger={(
                    <Button
                        className="z-0 rounded-xl self-center cursor-pointer transition-fast hover:-translate-y-[.25rem] disabled:opacity-50 disabled:cursor-not-allowed p-6"
                        color="primary"
                        variant="shadow"
                        size="md"
                        isLoading={invoiceIsCreating}
                        isDisabled={disabled || invoiceIsCreating}
                        startContent={<InvoiceIcon />}
                    >
                        New Invoice
                    </Button>
                )}
                onAction={(key) => {
                    switch (key) {
                        case "default": {
                            return createInvoice();
                        }
                        case "quote": {
                            return createInvoice(InvoiceType.QUOTE);
                        }
                    }
                }}
            >
                <DropdownItem
                    color="primary"
                    key="default"
                >
                    Invoice
                </DropdownItem>
                <DropdownItem
                    key="quote"
                    color="secondary"
                >
                    Quote
                </DropdownItem>
            </GenericDropdown>
        </>
    );
}