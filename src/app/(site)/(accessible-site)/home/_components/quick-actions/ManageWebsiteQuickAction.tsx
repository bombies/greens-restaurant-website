import { useState } from "react";
import { useRouter } from "next/navigation";
import UsersIcon from "../../../../../_components/icons/UsersIcon";
import QuickAction from "./QuickAction";
import GearsIcon from "../../../../../_components/icons/GearsIcon";
import Link from "next/link";

export default function ManageWebsiteQuickAction() {
    const [iconColor, setIconColor] = useState("#ffffff");
    const setActiveColor = () => setIconColor("#00D615");
    const setDefaultColor = () => setIconColor("#ffffff");
    const router = useRouter();

    const icon = <GearsIcon width="1.25rem" height="1.25rem" className="transition-fast" fill={iconColor} />;

    return (
        <Link href="/management">
            <QuickAction
                icon={icon}
                label={"Manage Website"}
                onHoverEnter={() => setActiveColor()}
                onHoverLeave={() => setDefaultColor()}
            />
        </Link>
    );
}