"use client";

import useSWR from "swr";
import { fetcher } from "../employees/_components/EmployeeGrid";
import { useUserData } from "../../../../utils/Hooks";
import Permission, { hasAnyPermission } from "../../../../libs/types/permission";
import { InventoryWithSections } from "../../../api/inventory/[name]/utils";
import { Fragment, useCallback, useMemo } from "react";
import BarSection from "./components/section/BarSection";
import { Spinner } from "@nextui-org/spinner";
import SubTitle from "../../../_components/text/SubTitle";
import { Divider } from "@nextui-org/divider";
import AddSectionButton from "./components/AddSectionButton";
import { Spacer } from "@nextui-org/react";
import { InventorySection } from "@prisma/client";
import { InventorySectionWithOptionalExtras } from "../../../api/inventory/bar/[name]/types";

const useBarInfo = () => {
    return useSWR("/api/inventory/bar", fetcher<InventoryWithSections>);
};

export default function BarPage() {
    const { data: userData } = useUserData([Permission.MUTATE_BAR_INVENTORY, Permission.VIEW_BAR_INVENTORY, Permission.CREATE_INVENTORY]);
    const { data: barInfo, isLoading: barInfoLoading, mutate: mutateBarInfo } = useBarInfo();
    const mutationAllowed = useMemo(() => hasAnyPermission(userData?.permissions, [
        Permission.MUTATE_BAR_INVENTORY, Permission.CREATE_INVENTORY
    ]), [userData?.permissions]);

    const sections = useMemo(() => barInfo?.inventorySections.map(section => (
        <Fragment key={section.id}>
            <BarSection
                barInfo={barInfo}
                mutateBarInfo={mutateBarInfo}
                section={section}
                userData={userData}
            />
            <Divider className="my-6" />
        </Fragment>
    )), [barInfo, mutateBarInfo, userData]);

    const addSection = useCallback(async (newSection: InventorySectionWithOptionalExtras) => {
        if (!barInfo)
            return;

        let sections = barInfo.inventorySections;
        sections.push(newSection);

        await mutateBarInfo({
            ...barInfo,
            inventorySections: sections
        });
    }, [barInfo, mutateBarInfo]);

    return (
        <div className="default-container p-12 phone:px-4">
            {
                barInfoLoading ?
                    <Spinner />
                    :
                    <Fragment>
                        {
                            mutationAllowed &&
                            <Fragment>
                                <AddSectionButton
                                    barName="bar"
                                    addSection={addSection}
                                    disabled={!mutationAllowed}
                                />
                                <Spacer y={6} />
                            </Fragment>
                        }
                        {
                            (sections?.length === 0 ?
                                    <SubTitle>{`There are no sections. Click on the "Add Section" button to create a
                                section.`}</SubTitle>
                                    :
                                    sections
                            )
                        }
                    </Fragment>
            }
        </div>
    );
}