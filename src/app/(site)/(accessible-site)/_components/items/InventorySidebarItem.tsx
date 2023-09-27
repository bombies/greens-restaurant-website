"use client"

import { useState } from "react";
import InventoryIcon from "../../../../_components/icons/InventoryIcon";
import SidebarItem from "./SidebarItem";

type Props = {
    sidebarOpened: boolean,
}

export default function InventorySidebarItem({sidebarOpened}: Props) {
    const [iconColor, setIconColor] = useState("#ffffff");
    const setActiveColor = () => setIconColor("#00D615");
    const setDefaultColor = () => setIconColor("#ffffff");

    const icon = <InventoryIcon width="1.25rem" height="1.25rem" className="transition-fast" fill={iconColor} />;
    return (<SidebarItem
        sidebarOpen={sidebarOpened}
        label={"Inventory"}
        href={"/inventory"}
        icon={icon}
        onHoverEnter={setActiveColor}
        onHoverLeave={setDefaultColor}
    />);
}