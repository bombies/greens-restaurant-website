"use client";

import { FC, Fragment, useState } from "react";
import GenericModal from "../../../../../_components/GenericModal";
import { FetchInvoiceByNumber, InvoiceWithCustomer } from "../../utils/invoice-client-utils";
import GenericButton from "../../../../../_components/inputs/GenericButton";
import SearchIcon from "../../../../../_components/icons/SearchIcon";
import GenericInput from "../../../../../_components/inputs/GenericInput";
import { Spacer } from "@nextui-org/react";
import { toast } from "react-hot-toast";
import { errorToast } from "../../../../../../utils/Hooks";
import { useRouter } from "next/navigation";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";

interface Props {
    disabled?: boolean;
}

export const SearchInvoiceButton: FC<Props> = ({ disabled }) => {
    const { register, handleSubmit, formState: { errors } } = useForm<FieldValues>();
    const [modalOpen, setModalOpen] = useState(false);
    const { trigger: triggerFetch, isMutating: isFetching } = FetchInvoiceByNumber();
    const router = useRouter();

    const onSubmit: SubmitHandler<FieldValues> = (data) => {
        const { invoiceSearch: searchValue } = data;
        if (!searchValue)
            return toast.error("You must provide an invoice number to search for!");

        triggerFetch({ number: Number(searchValue) })
            .then((res) => {
                const { customer, ...invoice }: InvoiceWithCustomer = res.data;
                toast.success("Invoice found! Now navigating...");
                router.push(`/invoices/${customer.id}/${invoice.id}`);
            })
            .catch((e) => {
                console.error(e);
                errorToast(e, "There was an error when looking for that invoice!");
            });
    };

    return (
        <Fragment>
            <GenericModal
                title="Search Invoice"
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
            >
                <form onSubmit={handleSubmit(onSubmit)}>
                    <GenericInput
                        id="invoiceSearch"
                        isDisabled={isFetching}
                        register={register}
                        errors={errors}
                        type="number"
                        label="Invoice Number"
                        startContent={<p className="text-neutral-500">#</p>}
                        placeholder="Enter an invoice number..."
                        min="0"
                        isRequired
                    />
                    <Spacer y={6} />
                    <GenericButton
                        variant="flat"
                        type="submit"
                        startContent={<SearchIcon fill="#00D615" />}
                        disabled={isFetching}
                        isLoading={isFetching}
                    >
                        Search
                    </GenericButton>
                </form>
            </GenericModal>
            <GenericButton
                startContent={<SearchIcon fill="#00D615" />}
                variant="flat"
                disabled={disabled}
                onPress={() => {
                    if (disabled)
                        return;
                    setModalOpen(true);
                }}
            >
                Search Invoice
            </GenericButton>
        </Fragment>
    );
};