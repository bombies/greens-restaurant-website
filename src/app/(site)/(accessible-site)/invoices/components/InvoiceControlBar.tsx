"use client";

import CreateInvoiceCustomerButton from "./CreateCustomerButton";
import EditCustomerButton from "../[id]/components/control-bar/EditCustomerButton";

type Props = {
    controlsEnabled?: boolean
}

export default function InvoiceControlBar({controlsEnabled}: Props) {
    return (
        <div className="default-container p-12">
            <CreateInvoiceCustomerButton disabled={!controlsEnabled} />
        </div>
    )
}