"use client";

import { FC, useMemo } from "react";
import { InventorySectionsSnapshot } from "../../../../../../api/inventory/location/[name]/types";
import LinkCard from "../../../../../../_components/LinkCard";

type Props = {
    snapshot: InventorySectionsSnapshot
}

const LocationSnapshotCard: FC<Props> = ({ snapshot }) => {
    const date = useMemo(() => new Date(snapshot.createdAt), [snapshot.createdAt]);

    return (
        <LinkCard href={`/bar/snapshots/${date.getTime()}`}>
            {date.toLocaleDateString("en-JM", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric"
            })}
        </LinkCard>
    );
};

export default LocationSnapshotCard;