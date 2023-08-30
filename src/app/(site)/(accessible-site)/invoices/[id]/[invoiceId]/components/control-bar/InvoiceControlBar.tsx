import { Invoice, InvoiceCustomer, InvoiceItem } from "@prisma/client";
import { Spacer } from "@nextui-org/react";
import React, { useState } from "react";
import BackIcon from "../../../../../../../_components/icons/BackIcon";
import Link from "next/link";
import EditInvoiceButton from "./EditInvoiceButton";
import ExportInvoiceButton from "./export/ExportInvoiceButton";
import DeleteInvoiceButton from "./DeleteInvoiceButton";
import { KeyedMutator } from "swr";
import { InvoiceWithOptionalItems } from "../../../../../home/_components/widgets/invoice/InvoiceWidget";

type Props = {
    customer?: InvoiceCustomer,
    invoice?: Invoice,
    invoiceItems?: InvoiceItem[],
    mutateInvoice: KeyedMutator<InvoiceWithOptionalItems | undefined>
    controlsEnabled?: boolean
}

export default function InvoiceControlBar({ customer, invoice, invoiceItems, controlsEnabled, mutateInvoice }: Props) {
    return (
        <div className="default-container p-12">
            <GoBackButton customerId={customer?.id} />
            <Spacer y={6} />
            <div className="grid grid-cols-3 tablet:grid-cols-1 gap-4">
                <EditInvoiceButton
                    customerId={customer?.id}
                    invoice={invoice}
                    disabled={!controlsEnabled}
                    mutateInvoice={mutateInvoice}
                />
                <ExportInvoiceButton
                    customer={customer}
                    invoice={invoice}
                    invoiceItems={invoiceItems}
                    disabled={!controlsEnabled}
                />
                <DeleteInvoiceButton
                    customerId={customer?.id}
                    invoice={invoice}
                    disabled={!controlsEnabled}
                />
            </div>
        </div>

    );
}

function GoBackButton({ customerId }: { customerId?: string }) {
    const [iconColor, setIconColor] = useState("#ffffff");
    const setActiveColor = () => setIconColor("#00D615");
    const setDefaultColor = () => setIconColor("#ffffff");

    const icon = <BackIcon width="1.25rem" height="1.25rem" className="self-center transition-fast" fill={iconColor} />;

    return (
        <Link href={`/invoices/${customerId}`}>
            <div
                className="flex gap-4 transition-fast hover:-translate-x-1 hover:text-primary"
                onMouseEnter={() => setActiveColor()}
                onMouseLeave={() => setDefaultColor()}
            >
                {icon}
                <p className="font-light">View all invoices</p>
            </div>
        </Link>
    );
}