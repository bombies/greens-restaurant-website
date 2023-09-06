"use client";

import useSWR from "swr";
import { fetcher } from "../../../../../employees/_components/EmployeeGrid";
import { BarSnapshot } from "../../../../../../../api/inventory/bar/[name]/types";

const FetchBarSnapshot = (time: number) => {
    return useSWR(`/api/inventory/bar/bar/snapshots/${time}`, fetcher<BarSnapshot>);
};

const useBarSnapshot = (time: number) => {
    return FetchBarSnapshot(time);
};

export default useBarSnapshot;