"use client";

import { FC, useCallback } from "react";
import { InventorySection, RequestedStockItem, User } from "@prisma/client";
import useSWR, { KeyedMutator } from "swr";
import { fetcher } from "../../../../employees/_components/EmployeeGrid";
import LocationStockTable from "./table/LocationStockTable";
import SubTitle from "../../../../../../_components/text/SubTitle";
import { Spacer } from "@nextui-org/react";
import LocationSectionControl from "./control/LocationSectionControl";
import { InventoryWithOptionalExtras } from "../../../../../../api/inventory/[name]/types";
import { InventorySectionSnapshotWithOptionalExtras } from "../../../../../../api/inventory/location/[name]/types";

type Props = {
    isLoading: boolean,
    locationInfo?: InventoryWithOptionalExtras,
    mutateLocationInfo?: KeyedMutator<InventoryWithOptionalExtras | undefined>
    section?: InventorySection,
    userData?: User,
    mutationAllowed: boolean,
    requestedItems: RequestedStockItem[],
}

const useCurrentLocationSectionSnapshot = (name?: string, sectionId?: string) => {
    return useSWR(`/api/inventory/location/${name}/${sectionId}/currentsnapshot`, fetcher<InventorySectionSnapshotWithOptionalExtras>);
};

export type PartialInventorySection = Partial<Omit<InventorySection, "id">>

const LocationSection: FC<Props> = ({ isLoading, locationInfo, mutateLocationInfo, section, userData, mutationAllowed, requestedItems }) => {
    const {
        data: currentSnapshot,
        isLoading: currentSnapshotLoading,
        mutate: mutateCurrentSnapshot
    } = useCurrentLocationSectionSnapshot(locationInfo?.name, section?.id);

    const mutateSection = useCallback(async (newInfo: PartialInventorySection) => {
        if (!locationInfo)
            return;

        let sections = locationInfo.inventorySections ?? [];
        const sectionIndex = sections?.findIndex(sec => sec.id === section?.id);
        if (sectionIndex === undefined || sectionIndex === -1)
            return;

        const foundSection = sections[sectionIndex];
        sections[sectionIndex] = {
            ...foundSection,
            ...newInfo
        };

        if (mutateLocationInfo) {
            await mutateLocationInfo({
                ...locationInfo,
                inventorySections: sections
            });
        }
    }, [locationInfo, mutateLocationInfo, section?.id]);

    const deleteSection = useCallback(async () => {
        if (!locationInfo)
            return;

        let sections = locationInfo.inventorySections ?? [];
        const sectionIndex = sections?.findIndex(sec => sec.id === section?.id) ?? -1;
        if (sectionIndex === -1)
            return;

        sections.splice(sectionIndex);
        if (mutateLocationInfo) {
            await mutateLocationInfo({
                ...locationInfo,
                inventorySections: sections
            });
        }
    }, [locationInfo, mutateLocationInfo, section?.id]);

    return (
        <div className="default-container p-6">
            <div className="flex gap-4">
                <SubTitle thick className="self-center">{section?.name ?? "Unknown"}</SubTitle>
                {(mutationAllowed && section && locationInfo) &&
                    <LocationSectionControl
                        locationName={locationInfo.name}
                        section={section}
                        mutateSection={mutateSection}
                        deleteSection={deleteSection}
                    />
                }
            </div>
            <Spacer y={6} />
            <LocationStockTable
                locationName={locationInfo?.name}
                section={section}
                currentSnapshot={currentSnapshot}
                mutateCurrentSnapshot={mutateCurrentSnapshot}
                stockIsLoading={isLoading || currentSnapshotLoading}
                mutationAllowed={mutationAllowed}
                requestedItems={requestedItems}
            />
        </div>
    );
};

export default LocationSection;