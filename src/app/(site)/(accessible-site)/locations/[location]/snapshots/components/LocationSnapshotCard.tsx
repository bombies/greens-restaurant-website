"use client";

import { FC, useMemo } from "react";
import { InventorySectionsSnapshot } from "../../../../../../api/inventory/location/[name]/types";
import LinkCard from "../../../../../../_components/LinkCard";
import { Inventory } from "@prisma/client";

type Props = {
    locationInfo?: Inventory
    snapshot: InventorySectionsSnapshot
}

const LocationSnapshotCard: FC<Props> = ({locationInfo, snapshot }) => {
    const date = useMemo(() => new Date(snapshot.createdAt), [snapshot.createdAt]);

    return (
        <LinkCard href={`/locations/${locationInfo?.name}/snapshots/${date.getTime()}`}>
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