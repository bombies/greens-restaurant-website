"use client";

import useBarSnapshots from "./components/hooks/useBarSnapshots";
import { Fragment, useMemo } from "react";
import CardSkeleton from "../../../../_components/skeletons/CardSkeleton";
import BarSnapshotCard from "./components/BarSnapshotCard";
import { useUserData } from "../../../../../utils/Hooks";
import Permission from "../../../../../libs/types/permission";

export default function BarSnapshotsPage() {
    useUserData([
        Permission.MUTATE_BAR_INVENTORY,
        Permission.MUTATE_STOCK,
        Permission.CREATE_INVENTORY
    ]);
    const { data: snapshots, isLoading } = useBarSnapshots();

    const cards = useMemo(() => snapshots?.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(snapshot => (
        <BarSnapshotCard key={snapshot.createdAt.toString()} snapshot={snapshot} />
    )) ?? [], [snapshots]);

    return (
        <div className="default-container p-6 grid grid-cols-3 tablet:grid-cols-1 gap-4">
            {
                isLoading ?
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