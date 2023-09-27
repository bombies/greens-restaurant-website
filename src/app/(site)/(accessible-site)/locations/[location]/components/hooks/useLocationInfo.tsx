"use client";

import useSWR from "swr";
import { fetcher } from "../../../../employees/_components/EmployeeGrid";
import { InventoryWithOptionalExtras, InventoryWithSections } from "../../../../../../api/inventory/[name]/types";

const useLocationInfo = (name: string) => {
    return useSWR(`/api/inventory/location/${name}`, fetcher<InventoryWithOptionalExtras>);
};

export default useLocationInfo;