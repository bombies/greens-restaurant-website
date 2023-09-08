"use client";

import useSWR from "swr";
import { fetcher } from "../../../../employees/_components/EmployeeGrid";
import { BarSnapshot } from "../../../../../../api/inventory/bar/[name]/types";

const FetchBarSnapshots = () => {
    return useSWR(`/api/inventory/bar/bar/snapshots`, fetcher<BarSnapshot[]>);
};

const useBarSnapshots = () => {
    return FetchBarSnapshots();
};

export default useBarSnapshots;