import { useState } from "react";
import { useRouter } from "next/navigation";
import QuickAction from "./QuickAction";
import UsersIcon from "../../../../../_components/icons/UsersIcon";
import Link from "next/link";

export default function AddUsersQuickAction() {
    const [iconColor, setIconColor] = useState("#ffffff");
    const setActiveColor = () => setIconColor("#00D615");
    const setDefaultColor = () => setIconColor("#ffffff");
    const router = useRouter();

    const icon = <UsersIcon width="1.25rem" height="1.25rem" className="transition-fast" fill={iconColor} />;

    return (
        <Link href="/employees">
            <QuickAction
                icon={icon}
                label={"Add Users"}
                onHoverEnter={() => setActiveColor()}
                onHoverLeave={() => setDefaultColor()}
            />
        </Link>
    );
}