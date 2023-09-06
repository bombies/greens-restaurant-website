"use client";

import useSWR from "swr";
import { fetcher } from "../../../employees/_components/EmployeeGrid";
import { InventoryWithSections } from "../../../../../api/inventory/[name]/types";

const useBarInfo = () => {
    return useSWR("/api/inventory/bar", fetcher<InventoryWithSections>);
};

export default useBarInfo;