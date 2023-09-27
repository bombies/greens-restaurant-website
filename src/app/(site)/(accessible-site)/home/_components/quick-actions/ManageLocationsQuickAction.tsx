"use client";

import { FC, Fragment, useState } from "react";
import Link from "next/link";
import RequestIcon from "../../../../../_components/icons/RequestIcon";
import QuickAction from "./QuickAction";
import BarIcon from "../../../../../_components/icons/BarIcon";
import LocationIcon from "../../../../../_components/icons/LocationIcon";

const ManageLocationsQuickAction: FC = () => {
    const [iconColor, setIconColor] = useState("#ffffff");
    const setActiveColor = () => setIconColor("#00D615");
    const setDefaultColor = () => setIconColor("#ffffff");

    return (
        <Link href="/locations">
            <QuickAction
                icon={<LocationIcon width={16} className="transition-fast" fill={iconColor} />}
                label="Manage Locations"
                onHoverEnter={() => setActiveColor()}
                onHoverLeave={() => setDefaultColor()}
            />
        </Link>
    );
};

export default ManageLocationsQuickAction;