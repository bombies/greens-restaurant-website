"use client";

import GenericButton from "../../../../../../../_components/inputs/GenericButton";
import { Invoice } from "@prisma/client";

type Props = {
    customerId?: string
    invoice?: Invoice
    disabled: boolean
}

export default function ExportInvoiceButton({ customerId, invoice, disabled }: Props) {
    return (
        <>
            <GenericButton
                color="warning"
                variant="flat"
            >
                Export Invoice
            </GenericButton>
        </>
    );
}