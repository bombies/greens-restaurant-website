"use client"

import { useState } from "react";
import UsersIcon from "../../../../_components/icons/UsersIcon";
import SidebarItem from "./SidebarItem";

type Props = {
    sidebarOpened: boolean,
}

export default function EmployeesSidebarItem({sidebarOpened}: Props) {
    const [iconColor, setIconColor] = useState("#ffffff");
    const setActiveColor = () => setIconColor("#00D615");
    const setDefaultColor = () => setIconColor("#ffffff");

    const icon = <UsersIcon width="1.25rem" height="1.25rem" className="transition-fast" fill={iconColor} />;
    return (<SidebarItem
        sidebarOpen={sidebarOpened}
        label={"Employees"}
        href={"/employees"}
        icon={icon}
        onHoverEnter={setActiveColor}
        onHoverLeave={setDefaultColor}
    />);
}