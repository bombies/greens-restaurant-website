"use client";

import useLocationSnapshots from "./components/hooks/useLocationSnapshots";
import { Fragment, useMemo } from "react";
import CardSkeleton from "../../../../../_components/skeletons/CardSkeleton";
import LocationSnapshotCard from "./components/LocationSnapshotCard";
import { useUserData } from "../../../../../../utils/Hooks";
import Permission from "../../../../../../libs/types/permission";
import useLocationInfo from "../components/hooks/useLocationInfo";

type Context = {
    params: {
        location: string,
    }
}

export default function LocationSnapshotsPage({ params }: Context) {
    useUserData([
        Permission.MUTATE_LOCATIONS,
        Permission.MUTATE_STOCK,
        Permission.CREATE_INVENTORY
    ]);
    const { data: locationInfo, isLoading: locationInfoLoading } = useLocationInfo(params.location);
    const { data: snapshots, isLoading } = useLocationSnapshots(params.location);

    const cards = useMemo(() => snapshots?.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(snapshot => (
        <LocationSnapshotCard
            locationInfo={locationInfo}
            key={snapshot.createdAt.toString()}
            snapshot={snapshot}
        />
    )) ?? [], [locationInfo, snapshots]);

    return (
        <div className="default-container p-6 grid grid-cols-3 tablet:grid-cols-1 gap-4">
            {
                isLoading || locationInfoLoading ?
                    <Fragment>
                        <CardSkeleton />
                        <CardSkeleton />
                        <CardSkeleton />
                        <CardSkeleton />
                        <CardSkeleton />
                    </Fragment>
                    :
                    cards
            }
        </div>
    );
}