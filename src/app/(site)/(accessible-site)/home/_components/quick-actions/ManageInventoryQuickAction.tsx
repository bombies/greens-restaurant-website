"use client";

import QuickAction from "./QuickAction";
import InventoryIcon from "../../../../../_components/icons/InventoryIcon";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ManageInventoryQuickAction() {
    const [iconColor, setIconColor] = useState("#ffffff");
    const setActiveColor = () => setIconColor("#00D615");
    const setDefaultColor = () => setIconColor("#ffffff");
    const router = useRouter();

    const icon = <InventoryIcon width="1.25rem" height="1.25rem" className="transition-fast" fill={iconColor} />;

    return (
        <Link href="/inventory">
            <QuickAction
                icon={icon}
                label={"Manage Inventory"}
                onHoverEnter={() => setActiveColor()}
                onHoverLeave={() => setDefaultColor()}
            />
        </Link>
    );
}