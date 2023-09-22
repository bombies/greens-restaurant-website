"use client";

import useSWR from "swr";
import { fetcher } from "../../../../../employees/_components/EmployeeGrid";
import { InventorySectionsSnapshot } from "../../../../../../../api/inventory/location/[name]/types";

const FetchLocationSnapshots = (locationName: string) => {
    return useSWR(`/api/inventory/location/${locationName}/snapshots`, fetcher<InventorySectionsSnapshot[]>);
};

const useLocationSnapshots = (locationName: string) => {
    return FetchLocationSnapshots(locationName);
};

export default useLocationSnapshots;