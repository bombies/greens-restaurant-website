import { FC, useMemo } from "react";
import { Inventory } from "@prisma/client";
import LocationCard from "./LocationCard";

type Props = {
    locations: Inventory[]
}

const LocationGrid: FC<Props> = ({ locations }) => {
    const cards = useMemo(() => locations.map(location => (
        <LocationCard key={location.id} location={location} />
    )), [locations]);

    return (
        <div className="grid grid-cols-3 tablet:grid-cols-1 gap-4">
            {cards}
        </div>
    );
};

export default LocationGrid;