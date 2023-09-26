"use client";

import { FC } from "react";
import { usePathname, useRouter } from "next/navigation";
import GenericButton from "../../../../../_components/inputs/GenericButton";
import EyeIcon from "../../../../../_components/icons/EyeIcon";
import SparklesIcon from "../../../../../_components/icons/SparklesIcon";
import { GoBackButton } from "../../../invoices/[id]/components/control-bar/InvoiceCustomerControlBar";
import { Spacer } from "@nextui-org/react";
import useLocationInfo from "./hooks/useLocationInfo";

type Props = {
    locationName: string
}

const LocationInventoryControlBar: FC<Props> = ({ locationName }) => {
    const router = useRouter();
    const pathName = usePathname();
    const { data: locationInfo } = useLocationInfo(locationName);

    const customSnapshotRegex = new RegExp(`\/locations\/${locationInfo?.name}\/snapshots\/.+`);
    const currentSnapshotRegex = new RegExp(`\/locations\/${locationInfo?.name}`);
    const snapshotPageRegex = new RegExp(`\/locations\/${locationInfo?.name}\/snapshots`);
    const insightPageRegex = new RegExp(`\/locations\/${locationInfo?.name}\/insights`);

    return (
        <div className="default-container p-12 phone:px-4 ">
            <GoBackButton label="View All Locations" href="/locations" />
            <Spacer y={6} />
            <div
                className="grid grid-cols-3 tablet:grid-cols-2 phone:grid-cols-1 gap-4 phone:gap-6">
                <GenericButton
                    fullWidth
                    variant="flat"
                    startContent={<EyeIcon />}
                    onPress={() => {
                        let url: string;
                        if (customSnapshotRegex.test(pathName)) {
                            url = `/locations/${locationInfo?.name}/snapshots`;
                        } else if (snapshotPageRegex.test(pathName)) {
                            url = `/locations/${locationInfo?.name}`;
                        } else if (currentSnapshotRegex.test(pathName)) {
                            url = `/locations/${locationInfo?.name}/snapshots`;
                        } else url = `/locations/${locationInfo?.name}/snapshots`;

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
                            url = `/locations/${locationInfo?.name}`;
                        } else url = `/locations/${locationInfo?.name}/insights`;

                        router.push(url);
                    }}
                >{insightPageRegex.test(pathName) ? "View Current Stock" : "View Insights"}</GenericButton>
            </div>
        </div>

    );
};

export default LocationInventoryControlBar;