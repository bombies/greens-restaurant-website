"use client";

import { useState } from "react";
import ConfirmationModal from "../../../../../../_components/ConfirmationModal";
import { InvoiceCustomer } from "@prisma/client";
import "../../../../../../../utils/GeneralUtils";
import GenericButton from "../../../../../../_components/inputs/GenericButton";

type Props = {
    customer?: InvoiceCustomer,
    disabled?: boolean
}

export default function DeleteCustomerButton({ customer, disabled }: Props) {
    const [modalOpen, setModalOpen] = useState(false);

    return (
        <>
            <ConfirmationModal
                isOpen={modalOpen}
                setOpen={setModalOpen}
                title="Delete Customer"
                message={`Are you sure you want to delete ${customer?.customerName.capitalize()}`}
                onAccept={() => {

                }}
            />
            <GenericButton
                disabled={disabled}
                color="danger"
                variant="flat"
                onPress={() => setModalOpen(true)}
            >
                Delete {customer?.customerName.capitalize()}
            </GenericButton>
        </>
    );
}