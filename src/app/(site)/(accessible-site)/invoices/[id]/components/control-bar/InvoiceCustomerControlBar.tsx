"use client";

import CreateInvoiceButton from "./CreateInvoiceButton";
import EditCustomerButton from "./EditCustomerButton";
import { InvoiceCustomer } from "@prisma/client";
import DeleteCustomerButton from "./DeleteCustomerButton";
import React, { useState } from "react";
import BackIcon from "../../../../../../_components/icons/BackIcon";
import Link from "next/link";
import { Spacer } from "@nextui-org/react";
import GenericButton from "../../../../../../_components/inputs/GenericButton";
import ReportsIcon from "../../../../../../_components/icons/ReportsIcon";
import { InvoiceCustomerWithOptionalItems } from "../../../../home/_components/widgets/invoice/InvoiceWidget";
import { KeyedMutator } from "swr";

type Props = {
    customer?: InvoiceCustomer,
    mutator: KeyedMutator<InvoiceCustomerWithOptionalItems | undefined>,
    controlsEnabled?: boolean
}

export default function InvoiceCustomerControlBar({ customer, controlsEnabled, mutator }: Props) {
    return (
        <div className="default-container p-12">
            <GoBackButton href="/invoices" label="View all customers" />
            <Spacer y={6} />
            <div className="grid grid-cols-4 tablet:grid-cols-1 gap-4">
                <CreateInvoiceButton
                    customer={customer}
                    disabled={!controlsEnabled}
                    mutator={mutator}
                />
                <EditCustomerButton
                    customer={customer}
                    disabled={!controlsEnabled}
                    mutator={mutator}
                />
                <GenericButton
                    color="warning"
                    variant="flat"
                    as={Link}
                    startContent={<ReportsIcon fill="#ffa700" />}
                    href={`/invoices/${customer?.id}/reports`}
                >Reports</GenericButton>
                <DeleteCustomerButton customer={customer} disabled={!controlsEnabled} />
            </div>
        </div>
    );
}

type GoBackButtonProps = {
    label: string,
    href: string,
}

export function GoBackButton({ label, href }: GoBackButtonProps) {
    const [iconColor, setIconColor] = useState("#ffffff");
    const setActiveColor = () => setIconColor("#00D615");
    const setDefaultColor = () => setIconColor("#ffffff");

    const icon = <BackIcon width="1.25rem" height="1.25rem" className="self-center transition-fast" fill={iconColor} />;

    return (
        <Link href={href}>
            <div
                className="flex gap-4 transition-fast hover:-translate-x-1 hover:text-primary"
                onMouseEnter={() => setActiveColor()}
                onMouseLeave={() => setDefaultColor()}
            >
                {icon}
                <p className="font-light">{label}</p>
            </div>
        </Link>
    );
}