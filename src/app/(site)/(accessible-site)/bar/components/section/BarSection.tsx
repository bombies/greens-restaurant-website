"use client";

import { FC, useCallback } from "react";
import { InventorySection, RequestedStockItem, User } from "@prisma/client";
import useSWR, { KeyedMutator } from "swr";
import { fetcher } from "../../../employees/_components/EmployeeGrid";
import BarStockTable from "./table/BarStockTable";
import SubTitle from "../../../../../_components/text/SubTitle";
import { Spacer } from "@nextui-org/react";
import BarSectionControl from "./control/BarSectionControl";
import { InventoryWithOptionalExtras } from "../../../../../api/inventory/[name]/types";
import { InventorySectionSnapshotWithOptionalExtras } from "../../../../../api/inventory/bar/[name]/types";

type Props = {
    barInfo?: InventoryWithOptionalExtras,
    mutateBarInfo?: KeyedMutator<InventoryWithOptionalExtras | undefined>
    section?: InventorySection,
    userData?: User,
    mutationAllowed: boolean,
    requestedItems: RequestedStockItem[],
}

const useCurrentBarSectionSnapshot = (name?: string, sectionId?: string) => {
    return useSWR(`/api/inventory/bar/${name}/${sectionId}/currentsnapshot`, fetcher<InventorySectionSnapshotWithOptionalExtras>);
};

export type PartialInventorySection = Partial<Omit<InventorySection, "id">>

const BarSection: FC<Props> = ({ barInfo, mutateBarInfo, section, userData, mutationAllowed, requestedItems }) => {
    const {
        data: currentSnapshot,
        isLoading: currentSnapshotLoading,
        mutate: mutateCurrentSnapshot
    } = useCurrentBarSectionSnapshot(barInfo?.name, section?.id);

    const mutateSection = useCallback(async (newInfo: PartialInventorySection) => {
        if (!barInfo)
            return;

        let sections = barInfo.inventorySections ?? [];
        const sectionIndex = sections?.findIndex(sec => sec.id === section?.id);
        if (sectionIndex === undefined || sectionIndex === -1)
            return;

        const foundSection = sections[sectionIndex];
        sections[sectionIndex] = {
            ...foundSection,
            ...newInfo
        };

        if (mutateBarInfo) {
            await mutateBarInfo({
                ...barInfo,
                inventorySections: sections
            });
        }
    }, [barInfo, mutateBarInfo, section?.id]);

    const deleteSection = useCallback(async () => {
        if (!barInfo)
            return;

        let sections = barInfo.inventorySections ?? [];
        const sectionIndex = sections?.findIndex(sec => sec.id === section?.id) ?? -1;
        if (sectionIndex === -1)
            return;

        sections.splice(sectionIndex);
        if (mutateBarInfo) {
            await mutateBarInfo({
                ...barInfo,
                inventorySections: sections
            });
        }
    }, [barInfo, mutateBarInfo, section?.id]);

    return (
        <div className="default-container p-6">
            <div className="flex gap-4">
                <SubTitle thick className="self-center">{section?.name ?? "Unknown"}</SubTitle>
                {(mutationAllowed && section && barInfo) &&
                    <BarSectionControl
                        barName={barInfo.name}
                        section={section}
                        mutateSection={mutateSection}
                        deleteSection={deleteSection}
                    />
                }
            </div>
            <Spacer y={6} />
            <BarStockTable
                barName={barInfo?.name}
                section={section}
                currentSnapshot={currentSnapshot}
                mutateCurrentSnapshot={mutateCurrentSnapshot}
                stockIsLoading={currentSnapshotLoading}
                mutationAllowed={mutationAllowed}
                requestedItems={requestedItems}
            />
        </div>
    );
};

export default BarSection;