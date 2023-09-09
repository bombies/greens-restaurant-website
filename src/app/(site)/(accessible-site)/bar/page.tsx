"use client";

import { useUserData } from "../../../../utils/Hooks";
import Permission, { hasAnyPermission } from "../../../../libs/types/permission";
import { Fragment, useCallback, useMemo, useState } from "react";
import BarSection from "./components/section/BarSection";
import SubTitle from "../../../_components/text/SubTitle";
import { Divider } from "@nextui-org/divider";
import AddSectionButton from "./components/AddSectionButton";
import { Skeleton, Spacer } from "@nextui-org/react";
import { InventorySectionWithOptionalExtras } from "../../../api/inventory/bar/[name]/types";
import TableSkeleton from "../../../_components/skeletons/TableSkeleton";
import useBarInfo from "./components/hooks/useBarInfo";
import GenericButton from "../../../_components/inputs/GenericButton";
import ToggleMutationOverrideButton from "./components/ToggleMutationOverrideButton";

export default function BarPage() {
    const { data: userData } = useUserData([Permission.MUTATE_BAR_INVENTORY, Permission.VIEW_BAR_INVENTORY, Permission.CREATE_INVENTORY]);
    const { data: barInfo, isLoading: barInfoLoading, mutate: mutateBarInfo } = useBarInfo();
    const [mutationOverridden, setMutationOverridden] = useState(false);

    const mutationAllowed = useMemo(() => (
        mutationOverridden || hasAnyPermission(userData?.permissions, [
            Permission.MUTATE_BAR_INVENTORY, Permission.CREATE_INVENTORY
        ]) && new Date().getDay() === 0
    ), [mutationOverridden, userData?.permissions]);

    const mutationOverridable = useMemo(() => (
        hasAnyPermission(userData?.permissions, [
            Permission.MUTATE_BAR_INVENTORY, Permission.CREATE_INVENTORY
        ]) && new Date().getDay() !== 0
    ), [userData?.permissions]);

    const sections = useMemo(() => barInfo?.inventorySections?.map(section => (
        <Fragment key={section.id}>
            <BarSection
                barInfo={barInfo}
                mutateBarInfo={mutateBarInfo}
                section={section}
                userData={userData}
                mutationAllowed={mutationAllowed}
            />
            <Divider className="my-6" />
        </Fragment>
    )) ?? [], [barInfo, mutateBarInfo, mutationAllowed, userData]);

    const addSection = useCallback(async (newSection: InventorySectionWithOptionalExtras) => {
        if (!barInfo)
            return;

        let sections = barInfo.inventorySections ?? [];
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
                    <div className="default-container p-6">
                        <Skeleton className="rounded-2xl w-1/4 h-6" />
                        <Spacer y={6} />
                        <Skeleton className="rounded-2xl w-1/4 h-12" />
                        <Spacer y={6} />
                        <TableSkeleton columns={[
                            {
                                key: "stock_name",
                                value: "Name"
                            },
                            {
                                key: "stock_quantity",
                                value: "Quantity"
                            }
                        ]} contentRepeat={10} />
                    </div>
                    :
                    <Fragment>
                        <Fragment>
                            {
                                mutationAllowed ?
                                    <AddSectionButton
                                        barName="bar"
                                        addSection={addSection}
                                        disabled={!mutationAllowed}
                                    />
                                    :
                                    (mutationOverridable &&
                                        <ToggleMutationOverrideButton
                                            setMutationOverridden={setMutationOverridden}
                                        />

                                    )
                            }
                            <Spacer y={6} />
                        </Fragment>
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