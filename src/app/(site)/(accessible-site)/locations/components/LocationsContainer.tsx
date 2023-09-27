"use client";

import { FC } from "react";
import { useUserData } from "../../../../../utils/Hooks";
import Permission, { hasPermission } from "../../../../../libs/types/permission";
import SubTitle from "../../../../_components/text/SubTitle";
import { Divider } from "@nextui-org/divider";
import AddLocationButton from "./AddLocationButton";
import useLocations from "./hooks/useLocations";
import LocationGrid from "./grid/LocationGrid";
import CardSkeleton from "../../../../_components/skeletons/CardSkeleton";

const LocationsContainer: FC = () => {
    const { data: userData, isLoading: userDataLoading } = useUserData([
        Permission.CREATE_INVENTORY, Permission.VIEW_LOCATIONS, Permission.MUTATE_LOCATIONS
    ]);
    const {
        data: locations,
        isLoading: locationsLoading,
        optimisticMutations: { addOptimisticLocation }
    } = useLocations();

    return (
        <div className="default-container p-12">
            <div className="flex gap-4">
                <SubTitle className="self-center">Locations</SubTitle>
                {hasPermission(userData?.permissions, Permission.CREATE_INVENTORY) &&
                    <AddLocationButton addOptimisticLocation={addOptimisticLocation} />
                }
            </div>
            <Divider className="mt-3 mb-8" />
            {
                locationsLoading || userDataLoading ?
                    <div className="grid grid-cols-3 tablet:grid-cols-1 gap-4">
                        <CardSkeleton />
                        <CardSkeleton />
                        <CardSkeleton />
                        <CardSkeleton />
                        <CardSkeleton />
                        <CardSkeleton />
                    </div>
                    :
                    <LocationGrid locations={locations ?? []} />
            }
        </div>
    );
};

export default LocationsContainer;