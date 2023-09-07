"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
import QuickAction from "./QuickAction";
import InvoiceIcon from "../../../../../_components/icons/InvoiceIcon";
import Link from "next/link";

export default function CreateInvoiceQuickAction() {
    const [iconColor, setIconColor] = useState("#ffffff");
    const setActiveColor = () => setIconColor("#00D615");
    const setDefaultColor = () => setIconColor("#ffffff");
    const router = useRouter();

    const icon = <InvoiceIcon width="1.25rem" height="1.25rem" className="transition-fast" fill={iconColor} />;

    return (
        <Link href="/invoices">
            <QuickAction
                icon={icon}
                label={"Create Invoice"}
                onHoverEnter={() => setActiveColor()}
                onHoverLeave={() => setDefaultColor()}
            />
        </Link>
    );
}