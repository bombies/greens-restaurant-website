"use client";

import AddStockItemButton from "./AddStockItemButton";
import GenericButton from "../../../../../_components/inputs/GenericButton";
import { useUserData } from "../../../../../../utils/Hooks";
import { hasAnyPermission, Permission } from "../../../../../../libs/types/permission";
import { useCurrentStock } from "./CurrentStockContext";
import { usePathname, useRouter } from "next/navigation";

type Props = {
    inventoryName: string,
}

export default function SpecificInventoryControlBar({ inventoryName }: Props) {
    const { data, isLoading } = useUserData();
    const [, setCurrentData] = useCurrentStock();
    const router = useRouter();
    const pathName = usePathname();

    const customSnapshotRegex = /\/inventory\/[a-zA-Z0-9-]+\/snapshots\/.+/;
    const currentSnapshotRegex = /\/inventory\/[a-zA-Z0-9-]+/;
    const snapshotPageRegex = /\/inventory\/[a-zA-Z0-9-]+\/snapshots/;
    const insightPageRegex = /\/inventory\/[a-zA-Z0-9-]+\/insights/;

    return (
        <div className="default-container p-12 phone:px-4 flex phone:flex-col gap-4 phone:gap-2">
            <AddStockItemButton
                inventoryName={inventoryName}
                setCurrentData={setCurrentData}
                disabled={!hasAnyPermission(data?.permissions, [Permission.CREATE_INVENTORY, Permission.MUTATE_STOCK])}
            />
            <GenericButton
                variant="flat"
                onPress={() => {
                    let url: string;
                    if (customSnapshotRegex.test(pathName)) {
                        url = `/inventory/${inventoryName}/snapshots`;
                    } else if (snapshotPageRegex.test(pathName)) {
                        url = `/inventory/${inventoryName}/`;
                    } else if (currentSnapshotRegex.test(pathName)) {
                        url = `/inventory/${inventoryName}/snapshots`;
                    } else url = `/inventory/${inventoryName}/snapshots`;

                    router.push(url);
                }}>{
                customSnapshotRegex.test(pathName) ? "View Snapshots" :
                    snapshotPageRegex.test(pathName) ? "Back To Current Stock" :
                        currentSnapshotRegex.test(pathName) ? "View Snapshots" :
                            "View Current Stock"
            }</GenericButton>
            <GenericButton
                variant="flat"
                onPress={() => {
                    let url: string;
                    if (insightPageRegex.test(pathName)) {
                        url = `/inventory/${inventoryName}/`;
                    } else url = `/inventory/${inventoryName}/insights`;

                    router.push(url);
                }}
            >{insightPageRegex.test(pathName) ? "View Current Stock" : "View Insights"}</GenericButton>
        </div>
    );
}