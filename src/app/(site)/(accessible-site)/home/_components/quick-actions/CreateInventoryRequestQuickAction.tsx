import { FC, useState } from "react";
import QuickAction from "./QuickAction";
import Link from "next/link";
import RequestIcon from "../../../../../_components/icons/RequestIcon";

const CreateInventoryRequestQuickAction: FC = () => {
    const [iconColor, setIconColor] = useState("#ffffff");
    const setActiveColor = () => setIconColor("#00D615");
    const setDefaultColor = () => setIconColor("#ffffff");

    return (
        <Link href="/inventory/requests">
            <QuickAction
                icon={<RequestIcon className="transition-fast" fill={iconColor} />}
                label="Make Inventory Request"
                onHoverEnter={() => setActiveColor()}
                onHoverLeave={() => setDefaultColor()}
            />
        </Link>
    );
};

export default CreateInventoryRequestQuickAction;