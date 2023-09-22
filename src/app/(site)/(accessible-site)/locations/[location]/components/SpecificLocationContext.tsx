"use client";

import { FC, Fragment, useCallback, useMemo, useState } from "react";
import useSWR from "swr";
import { fetcher } from "../../../employees/_components/EmployeeGrid";
import { RequestedStockItem } from "@prisma/client";
import { useUserData } from "../../../../../../utils/Hooks";
import Permission, { hasAnyPermission } from "../../../../../../libs/types/permission";
import useLocationInfo from "./hooks/useLocationInfo";
import LocationSection from "./section/LocationSection";
import { Divider } from "@nextui-org/divider";
import { InventorySectionWithOptionalExtras } from "../../../../../api/inventory/location/[name]/types";
import { Skeleton, Spacer } from "@nextui-org/react";
import TableSkeleton from "../../../../../_components/skeletons/TableSkeleton";
import AddSectionButton from "./AddSectionButton";
import ChecksAndBalancesButton from "./checks-and-balances/ChecksAndBalancesButton";
import ToggleMutationOverrideButton from "./ToggleMutationOverrideButton";
import SubTitle from "../../../../../_components/text/SubTitle";

type Props = {
    locationName: string
}

const useCurrentWeekInventoryRequestInfo = (stockIds?: (string | undefined)[]) => {
    const previousSunday = new Date();
    previousSunday.setHours(0, 0, 0, 0);
    if (previousSunday.getDate() !== 0)
        previousSunday.setDate(previousSunday.getDate() - (previousSunday.getDay() || 7));
    return useSWR(stockIds ? `/api/inventory/requests/items?ids=${stockIds?.filter(id => id).toString()}&from=${previousSunday.getTime()}` : [], fetcher<RequestedStockItem[]>);
};

const SpecificLocationContext: FC<Props> = ({ locationName }) => {
    const { data: userData } = useUserData([Permission.MUTATE_LOCATIONS, Permission.VIEW_LOCATIONS, Permission.CREATE_INVENTORY]);
    const { data: locationInfo, isLoading: locationInfoLoading, mutate: mutateBarInfo } = useLocationInfo(locationName);
    const {
        data: currentWeekRequestedItems,
        isLoading: loadingCurrentWeekendRequestedItems
    } = useCurrentWeekInventoryRequestInfo(locationInfo?.inventorySections?.map(section => section.assignedStock?.map(stock => stock.id)).flat());
    const [mutationOverridden, setMutationOverridden] = useState(false);

    const mutationAllowed = useMemo(() => (
        mutationOverridden || hasAnyPermission(userData?.permissions, [
            Permission.MUTATE_LOCATIONS, Permission.CREATE_INVENTORY
        ]) && new Date().getDay() === 0
    ), [mutationOverridden, userData?.permissions]);

    const mutationOverridable = useMemo(() => (
        hasAnyPermission(userData?.permissions, [
            Permission.MUTATE_LOCATIONS, Permission.CREATE_INVENTORY
        ]) && new Date().getDay() !== 0
    ), [userData?.permissions]);

    const sections = useMemo(() => locationInfo?.inventorySections?.map(section => (
        <Fragment key={section.id}>
            <LocationSection
                locationInfo={locationInfo}
                mutateLocationInfo={mutateBarInfo}
                section={section}
                userData={userData}
                mutationAllowed={mutationAllowed}
                requestedItems={currentWeekRequestedItems ?? []}
            />
            <Divider className="my-6" />
        </Fragment>
    )) ?? [], [locationInfo, mutateBarInfo, userData, mutationAllowed, currentWeekRequestedItems]);

    const addSection = useCallback(async (newSection: InventorySectionWithOptionalExtras) => {
        if (!locationInfo)
            return;

        let sections = locationInfo.inventorySections ?? [];
        sections.push(newSection);

        await mutateBarInfo({
            ...locationInfo,
            inventorySections: sections
        });
    }, [locationInfo, mutateBarInfo]);

    return (
        <div className="default-container p-12 phone:px-4">
            {
                locationInfoLoading ?
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
                                            locationInfo={locationInfo}
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
};