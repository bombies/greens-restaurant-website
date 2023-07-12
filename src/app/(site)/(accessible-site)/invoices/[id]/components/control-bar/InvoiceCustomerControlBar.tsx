"use client";

import CreateInvoiceButton from "./CreateInvoiceButton";
import EditCustomerButton from "./EditCustomerButton";
import { InvoiceCustomer } from "@prisma/client";
import DeleteCustomerButton from "./DeleteCustomerButton";
import React, { useState } from "react";
import BackIcon from "../../../../../../_components/icons/BackIcon";
import Link from "next/link";
import { Spacer } from "@nextui-org/react";

type Props = {
    customer?: InvoiceCustomer
    controlsEnabled?: boolean
}

export default function InvoiceCustomerControlBar({ customer, controlsEnabled }: Props) {
    return (
        <div className="default-container p-12">
            <GoBackButton />
            <Spacer y={6} />
            <div className="grid grid-cols-3 tablet:grid-cols-1 gap-4">
                <CreateInvoiceButton customerId={customer?.id} disabled={!controlsEnabled} />
                <EditCustomerButton customer={customer} disabled={!controlsEnabled} />
                <DeleteCustomerButton customer={customer} disabled={!controlsEnabled} />
            </div>
        </div>

    );
}

function GoBackButton() {
    const [iconColor, setIconColor] = useState("#ffffff");
    const setActiveColor = () => setIconColor("#00D615");
    const setDefaultColor = () => setIconColor("#ffffff");

    const icon = <BackIcon width="1.25rem" height="1.25rem" className="self-center transition-fast" fill={iconColor} />;

    return (
        <Link href="/invoices">
            <div
                className="flex gap-4 transition-fast hover:-translate-x-1 hover:text-primary"
                onMouseEnter={() => setActiveColor()}
                onMouseLeave={() => setDefaultColor()}
            >
                {icon}
                <p className="font-light">View all customers</p>
            </div>
        </Link>
    );
}