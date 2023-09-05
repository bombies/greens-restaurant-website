"use client";

import { FC, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import GenericButton from "../../../../_components/inputs/GenericButton";
import EyeIcon from "../../../../_components/icons/EyeIcon";
import SparklesIcon from "../../../../_components/icons/SparklesIcon";
import AddSectionButton from "./AddSectionButton";
import { Inventory } from "@prisma/client";
import { useUserData } from "../../../../../utils/Hooks";
import Permission, { hasAnyPermission } from "../../../../../libs/types/permission";

const customSnapshotRegex = /\/bar\/snapshots\/.+/;
const currentSnapshotRegex = /\/bar/;
const snapshotPageRegex = /\/bar\/snapshots/;
const insightPageRegex = /\/bar\/insights/;

type Props = {
    barInfo?: Inventory
}

const BarInventoryControlBar: FC<Props> = ({ barInfo }) => {
    const router = useRouter();
    const pathName = usePathname();

    return (
        <div
            className="default-container p-12 phone:px-4 grid grid-cols-3 tablet:grid-cols-2 phone:grid-cols-1 gap-4 phone:gap-6">
            <GenericButton
                fullWidth
                variant="flat"
                startContent={<EyeIcon />}
                onPress={() => {
                    let url: string;
                    if (customSnapshotRegex.test(pathName)) {
                        url = `/bar/snapshots`;
                    } else if (snapshotPageRegex.test(pathName)) {
                        url = `/bar`;
                    } else if (currentSnapshotRegex.test(pathName)) {
                        url = `/bar/snapshots`;
                    } else url = `/bar/snapshots`;

                    router.push(url);
                }}>{
                customSnapshotRegex.test(pathName) ? "View Snapshots" :
                    snapshotPageRegex.test(pathName) ? "Back To Current Stock" :
                        currentSnapshotRegex.test(pathName) ? "View Snapshots" :
                            "View Current Stock"
            }</GenericButton>
            <GenericButton
                fullWidth
                variant="flat"
                startContent={<SparklesIcon />}
                onPress={() => {
                    let url: string;
                    if (insightPageRegex.test(pathName)) {
                        url = `/bar`;
                    } else url = `/bar/insights`;

                    router.push(url);
                }}
            >{insightPageRegex.test(pathName) ? "View Current Stock" : "View Insights"}</GenericButton>
        </div>
    );
};

export default BarInventoryControlBar;