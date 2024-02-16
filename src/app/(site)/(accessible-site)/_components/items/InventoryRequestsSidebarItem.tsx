"use client";

import RequestIcon from "../../../../_components/icons/RequestIcon";
import SidebarItem from "./SidebarItem";
import { useState } from "react";

type Props = {
    sidebarOpened: boolean,
}

export default function InventoryRequestsSidebarItem({ sidebarOpened }: Props) {
    const [iconColor, setIconColor] = useState("#ffffff");
    const setActiveColor = () => setIconColor("#00D615");
    const setDefaultColor = () => setIconColor("#ffffff");

    const icon = <RequestIcon width="1.25rem" className="transition-fast" fill={iconColor} />;
    return (<SidebarItem
        sidebarOpen={sidebarOpened}
        label={"Inventory Requests"}
        href={"/inventory/requests"}
        onHoverEnter={setActiveColor}
        onHoverLeave={setDefaultColor}
        icon={icon}
        // subItems={[
        //     {
        //         label: "All Requests",
        //         href: "/inventory/requests?requests_tab=all_requests",
        //         icon: <RequestIcon width="1.25rem" className="transition-fast" />
        //     },
        //     {
        //         label: "Request Reports",
        //         href: "/inventory/requests?requests_tab=request_reports",
        //         icon: <RequestIcon width="1.25rem" className="transition-fast" />
        //     }
        // ]}
    />);
}