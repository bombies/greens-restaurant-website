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
import ToggleMutationOverrideButton from "./components/ToggleMutationOverrideButton";
import ChecksAndBalancesButton from "./components/checks-and-balances/ChecksAndBalancesButton";
import useSWR from "swr";
import { fetcher } from "../employees/_components/EmployeeGrid";
import { RequestedStockItem } from "@prisma/client";

const useCurrentWeekInventoryRequestInfo = (stockIds?: (string | undefined)[]) => {
    const previousSunday = new Date();
    previousSunday.setHours(0, 0, 0, 0);
    if (previousSunday.getDate() !== 0)
        previousSunday.setDate(previousSunday.getDate() - (previousSunday.getDay() || 7));
    return useSWR(stockIds ? `/api/inventory/requests/items?ids=${stockIds?.filter(id => id).toString()}&from=${previousSunday.getTime()}` : [], fetcher<RequestedStockItem[]>);
};

export default function BarPage() {
    const { data: userData } = useUserData([Permission.MUTATE_BAR_INVENTORY, Permission.VIEW_BAR_INVENTORY, Permission.CREATE_INVENTORY]);
    const { data: barInfo, isLoading: barInfoLoading, mutate: mutateBarInfo } = useBarInfo();
    const {
        data: currentWeekRequestedItems,
        isLoading: loadingCurrentWeekendRequestedItems
    } = useCurrentWeekInventoryRequestInfo(barInfo?.inventorySections?.map(section => section.assignedStock?.map(stock => stock.id)).flat());
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
                requestedItems={currentWeekRequestedItems ?? []}
            />
            <Divider className="my-6" />
        </Fragment>
    )) ?? [], [barInfo, mutateBarInfo, userData, mutationAllowed, currentWeekRequestedItems]);

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
                        <div className="flex gap-4">
                            {
                                mutationAllowed ?
                                    <Fragment>
                                        <AddSectionButton
                                            barName="bar"
                                            addSection={addSection}
                                        />
                                        <ChecksAndBalancesButton
                                            barInfo={barInfo}
                                        />
                                    </Fragment>
                                    :
                                    (mutationOverridable &&
                                        <ToggleMutationOverrideButton
                                            setMutationOverridden={setMutationOverridden}
                                        />

                                    )
                            }
                        </div>
                        <Spacer y={6} />
                        {
                            (sections?.length === 0 ?
                                    <SubTitle>{`There are no sections.${mutationAllowed ? " Click on the \"Add Section\" button to create a section." : ""}`}</SubTitle>
                                    :
                                    sections
                            )
                        }
                    </Fragment>
            }
        </div>
    );
}