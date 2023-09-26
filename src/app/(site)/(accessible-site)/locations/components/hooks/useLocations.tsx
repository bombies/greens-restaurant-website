"use client";

import useSWR from "swr";
import { fetcher } from "../../../employees/_components/EmployeeGrid";
import { InventoryWithOptionalExtras } from "../../../../../api/inventory/[name]/types";
import { useCallback } from "react";
import { Inventory } from "@prisma/client";

const useLocations = () => {
    const { data, isLoading, mutate } = useSWR("/api/inventory/location", fetcher<InventoryWithOptionalExtras[]>);

    const addOptimisticLocation = useCallback(async (location: Inventory) => {
        if (!data)
            return;

        await mutate([
            ...data,
            location
        ]);
    }, [data, mutate]);

    return {
        data, isLoading,
        optimisticMutations: {
            addOptimisticLocation
        }
    };
};

export default useLocations;