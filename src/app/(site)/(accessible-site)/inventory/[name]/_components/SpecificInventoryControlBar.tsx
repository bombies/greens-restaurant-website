"use client";

import AddStockItemButton from "./AddStockItemButton";
import GenericButton from "../../../../../_components/inputs/GenericButton";
import { useUserData } from "../../../../../../utils/Hooks";
import { hasAnyPermission, Permission } from "../../../../../../libs/types/permission";
import { useCurrentStock } from "./CurrentStockContext";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";

type Props = {
    inventoryName: string,
}

export default function SpecificInventoryControlBar({ inventoryName }: Props) {
    const { data, isLoading } = useUserData();
    const [, setCurrentData] = useCurrentStock();
    const router = useRouter();
    const pathName = usePathname();

    return (
        <div className="default-container p-12 phone:px-4 flex phone:flex-col gap-4 phone:gap-2">
            <AddStockItemButton
                inventoryName={inventoryName}
                setCurrentData={setCurrentData}
                disabled={!hasAnyPermission(data?.permissions, [Permission.CREATE_INVENTORY, Permission.MUTATE_STOCK])}
            />
            <GenericButton
                variant="flat"
                onPress={() => router.push(pathName.includes("snapshots") ? `/inventory/${inventoryName}` : `/inventory/${inventoryName}/snapshots`)}
            >{pathName.includes("snapshots") ? "View Current Data" : "View Snapshots"}</GenericButton>
        </div>
    );
}