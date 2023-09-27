"use client";

import { FC, Fragment, useCallback, useEffect, useMemo, useState } from "react";
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
import { AxiosError } from "axios";
import { notFound, useRouter } from "next/navigation";

type Props = {
    locationName: string
}

const useCurrentWeekInventoryRequestInfo = (locationName: string, stockIds?: (string | undefined)[]) => {
    const previousSunday = new Date();
    previousSunday.setHours(0, 0, 0, 0);
    if (previousSunday.getDate() !== 0)
        previousSunday.setDate(previousSunday.getDate() - (previousSunday.getDay() || 7));
    return useSWR(
        stockIds ? `/api/inventory/requests/items?loc_name=${locationName}${stockIds && stockIds.length ? `&ids=${stockIds.filter(id => id).toString()}` : ""}&from=${previousSunday.getTime()}` : [],
        fetcher<RequestedStockItem[]>
    );
};

const SpecificLocationContext: FC<Props> = ({ locationName }) => {
    const router = useRouter()
    const {
        data: userData,
        isLoading: userDataLoading
    } = useUserData([Permission.MUTATE_LOCATIONS, Permission.VIEW_LOCATIONS, Permission.CREATE_INVENTORY]);
    const {
        data: locationInfo,
        isLoading: locationInfoLoading,
        mutate: mutateBarInfo,
        error
    } = useLocationInfo(locationName);

    useEffect(() => {
        if (!error || !(error instanceof AxiosError))
            return;
        const status = error.response!.status
        if (status === 404)
            notFound()
    }, [error]);

    const {
        data: currentWeekRequestedItems,
        isLoading: loadingCurrentWeekendRequestedItems
    } = useCurrentWeekInventoryRequestInfo(locationName, locationInfo?.inventorySections?.map(section => section.assignedStock?.map(stock => stock.id)).flat());
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
                isLoading={loadingCurrentWeekendRequestedItems || userDataLoading}
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
                                            locationName={locationName}
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

export default SpecificLocationContext;