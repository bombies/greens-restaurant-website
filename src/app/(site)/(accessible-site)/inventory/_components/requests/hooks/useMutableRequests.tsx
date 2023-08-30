"use client";

import { StockRequestWithOptionalCreatorAndAssignees } from "../inventory-requests-utils";
import { useEffect, useState } from "react";
import { StockRequestStatus } from ".prisma/client";
import "../../../../../../../utils/GeneralUtils";

type Props = {
    data?: StockRequestWithOptionalCreatorAndAssignees[],
    dataIsLoading: boolean,
}

export enum RequestSortMode {
    NEWEST_OLDEST = "Newest - Oldest",
    OLDEST_NEWEST = "Oldest - Newest"
}

const useMutableRequests = ({ data, dataIsLoading }: Props) => {
    const [visibleRequests, setVisibleRequests] = useState(data);
    const [sortMode, setSortMode] = useState<RequestSortMode>();
    const [filters, setFilters] = useState<StockRequestStatus[]>();

    useEffect(() => {
        if (!dataIsLoading && data)
            setVisibleRequests(data);
    }, [data, dataIsLoading]);

    useEffect(() => {
        if (!data)
            return;
        setVisibleRequests(
            data.sort((a, b) => {
                switch (sortMode?.toLowerCase().replaceAll("_", " ")) {
                    case RequestSortMode.NEWEST_OLDEST.toLowerCase(): {
                        return new Date(b.createdAt.toString()).getTime() - new Date(a.createdAt.toString()).getTime();
                    }
                    case RequestSortMode.OLDEST_NEWEST.toLowerCase(): {
                        return new Date(a.createdAt.toString()).getTime() - new Date(b.createdAt.toString()).getTime();
                    }
                    default: {
                        return 0;
                    }
                }
            })
                .filter(request => {
                    if (!filters || !filters.length)
                        return true;
                    return filters.includes(request.status);
                })
        );
    }, [sortMode, filters, data]);

    return { visibleRequests, sortMode, setSortMode, filters, setFilters };
};

export default useMutableRequests;