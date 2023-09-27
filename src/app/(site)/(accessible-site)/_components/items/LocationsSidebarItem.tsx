"use client";

import { useState } from "react";
import LocationIcon from "../../../../_components/icons/LocationIcon";
import SidebarItem from "./SidebarItem";

type Props = {
    sidebarOpened: boolean,
}

export default function LocationsSidebarItem({ sidebarOpened }: Props) {
    const [iconColor, setIconColor] = useState("#ffffff");
    const setActiveColor = () => setIconColor("#00D615");
    const setDefaultColor = () => setIconColor("#ffffff");

    const icon = <LocationIcon width="1.25rem" height="1.25rem" className="transition-fast" fill={iconColor} />;
    return (<SidebarItem
        sidebarOpen={sidebarOpened}
        label={"Locations"}
        href={"/locations"}
        icon={icon}
        onHoverEnter={setActiveColor}
        onHoverLeave={setDefaultColor}
    />);
}