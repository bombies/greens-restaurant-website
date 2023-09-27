"use client";

import useSWR from "swr";
import { fetcher } from "../../../../../../employees/_components/EmployeeGrid";
import { InventorySectionsSnapshot } from "../../../../../../../../api/inventory/location/[name]/types";

const FetchLocationSnapshot = (name: string, time: number) => {
    return useSWR(`/api/inventory/location/${name}/snapshots/${time}`, fetcher<InventorySectionsSnapshot>);
};

const useLocationSnapshot = (name: string, time: number) => {
    return FetchLocationSnapshot(name, time);
};

export default useLocationSnapshot;