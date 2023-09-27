"use client"

import { useState } from "react";
import RequestIcon from "../../../../_components/icons/RequestIcon";
import SidebarItem from "./SidebarItem";

type Props = {
    sidebarOpened: boolean,
}

export default function InventoryRequestsSidebarItem({sidebarOpened}: Props) {
    const [iconColor, setIconColor] = useState("#ffffff");
    const setActiveColor = () => setIconColor("#00D615");
    const setDefaultColor = () => setIconColor("#ffffff");

    const icon = <RequestIcon width="1.25rem" className="transition-fast" fill={iconColor} />;
    return (<SidebarItem
        sidebarOpen={sidebarOpened}
        label={"Inventory Requests"}
        href={"/inventory/requests"}
        icon={icon}
        onHoverEnter={setActiveColor}
        onHoverLeave={setDefaultColor}
    />);
}