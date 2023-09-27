"use client";

import { useState } from "react";
import AccountIcon from "../../../../_components/icons/AccountIcon";
import SidebarItem from "./SidebarItem";

type Props = {
    sidebarOpened: boolean,
}

export default function AccountSidebarItem({sidebarOpened}: Props) {
    const [iconColor, setIconColor] = useState("#ffffff");
    const setActiveColor = () => setIconColor("#00D615");
    const setDefaultColor = () => setIconColor("#ffffff");

    const icon = <AccountIcon width="1.25rem" height="1.25rem" className="transition-fast" fill={iconColor} />;
    return (<SidebarItem
        sidebarOpen={sidebarOpened}
        label={"My Account"}
        href={"/account"}
        icon={icon}
        onHoverEnter={setActiveColor}
        onHoverLeave={setDefaultColor}
    />);
}