"use client";

import { FC } from "react";
import LinkCard from "../../../../../_components/LinkCard";
import { Inventory } from "@prisma/client";
import "../../../../../../utils/GeneralUtils";

type Props = {
    location: Inventory
}

const LocationCard: FC<Props> = ({ location }) => {
    return (
        <LinkCard href={`/locations/${location.name}`}>
            {location.name.replaceAll("-", " ").capitalize()}
        </LinkCard>
    );
};

export default LocationCard;