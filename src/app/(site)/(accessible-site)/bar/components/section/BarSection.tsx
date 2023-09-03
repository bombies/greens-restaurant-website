"use client";

import { FC, useCallback } from "react";
import { InventorySection, User } from "@prisma/client";
import useSWR, { KeyedMutator } from "swr";
import { fetcher } from "../../../employees/_components/EmployeeGrid";
import {
    InventorySectionSnapshotWithExtras, InventoryWithSections
} from "../../../../../api/inventory/[name]/utils";
import Permission, { hasAnyPermission } from "../../../../../../libs/types/permission";
import BarStockTable from "./table/BarStockTable";
import SubTitle from "../../../../../_components/text/SubTitle";
import { Spacer } from "@nextui-org/react";
import BarSectionControl from "./control/BarSectionControl";

type Props = {
    barInfo?: InventoryWithSections,
    mutateBarInfo: KeyedMutator<InventoryWithSections | undefined>
    section?: InventorySection,
    userData?: User
}

const useCurrentBarSectionSnapshot = (name?: string, sectionId?: string) => {
    return useSWR(`/api/inventory/bar/${name}/${sectionId}/currentsnapshot`, fetcher<InventorySectionSnapshotWithExtras>);
};

export type PartialInventorySection = Partial<Omit<InventorySection, "id">>

const BarSection: FC<Props> = ({ barInfo, mutateBarInfo, section, userData }) => {
    const {
        data: currentSnapshot,
        isLoading: currentSnapshotLoading,
        mutate: mutateCurrentSnapshot
    } = useCurrentBarSectionSnapshot(barInfo?.name, section?.id);

    const mutateSection = useCallback(async (newInfo: PartialInventorySection) => {
        if (!barInfo)
            return;

        let sections = barInfo.inventorySections;
        const sectionIndex = sections.findIndex(sec => sec.id === section?.id);
        if (sectionIndex === -1)
            return;

        const foundSection = sections[sectionIndex];
        sections[sectionIndex] = {
            ...foundSection,
            ...newInfo
        };

        await mutateBarInfo({
            ...barInfo,
            inventorySections: sections
        });
    }, [barInfo, mutateBarInfo, section?.id]);

    const deleteSection = useCallback(async () => {
        if (!barInfo)
            return;

        let sections = barInfo.inventorySections;
        const sectionIndex = sections.findIndex(sec => sec.id === section?.id);
        if (sectionIndex === -1)
            return;

        sections.splice(sectionIndex);
        await mutateBarInfo({
            ...barInfo,
            inventorySections: sections
        });
    }, [barInfo, mutateBarInfo, section?.id]);

    return (
        <div className="default-container p-6">
            <div className="flex gap-4">
                <SubTitle thick className="self-center">{section?.name ?? "Unknown"}</SubTitle>
                {(section && barInfo) &&
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
                mutationAllowed={hasAnyPermission(userData?.permissions, [
                    Permission.CREATE_INVENTORY,
                    Permission.MUTATE_BAR_INVENTORY
                ])}
            />
        </div>
    );
};

export default BarSection;