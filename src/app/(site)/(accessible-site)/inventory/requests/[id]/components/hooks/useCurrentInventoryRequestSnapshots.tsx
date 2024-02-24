"use client";

import useSWR from "swr";
import { fetcher } from "../../../../../employees/_components/EmployeeGrid";
import { StockRequestStatus } from ".prisma/client";
import { InventorySnapshotWithOptionalExtras } from "../../../../../../../api/inventory/[name]/types";
import { StockRequestWithOptionalExtras } from "@/app/api/inventory/requests/types";

const FetchCurrentSnapshots = (isAdmin: boolean, requestIsLoading: boolean, request?: StockRequestWithOptionalExtras) => {
    const allIds = request?.requestedItems?.map(requestedStock =>
        requestedStock.stock?.inventory?.id ?? ""
    ) ?? [];
    const ids = Array.from(new Set(allIds));
    return useSWR(isAdmin && !requestIsLoading && request && request.status === StockRequestStatus.PENDING ? `/api/inventory/currentsnapshots?ids=${ids.toString()}` : undefined, fetcher<InventorySnapshotWithOptionalExtras[]>);
};

type Args = {
    isAdmin: boolean,
    request?: StockRequestWithOptionalExtras,
    requestIsLoading: boolean,
}

const useCurrentInventoryRequestSnapshots = ({ isAdmin, request, requestIsLoading }: Args) => {
    const {
        data: snapshots,
        isLoading: isLoadingSnapshots
    } = FetchCurrentSnapshots(isAdmin, requestIsLoading, request);

    return { snapshots, isLoadingSnapshots };
};

export default useCurrentInventoryRequestSnapshots;