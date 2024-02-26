"use client";

import { StockRequestWithOptionalCreator, StockRequestWithOptionalCreatorAndAssignees } from "../inventory-requests-utils";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { StockRequestStatus } from ".prisma/client";
import "../../../../../../../utils/GeneralUtils";
import SortIcon from "../../../../../../_components/icons/SortIcon";
import DropdownInput from "../../../../../../_components/inputs/DropdownInput";
import FilterIcon from "../../../../../../_components/icons/FilterIcon";
import { Checkbox } from "@nextui-org/react";
import PendingIcon from "../../../../../../_components/icons/PendingIcon";
import DeliveredIcon from "../../../../../../_components/icons/DeliveredIcon";
import DeniedIcon from "../../../../../../_components/icons/DeniedIcon";
import CheckboxMenu from "../../../../../../_components/CheckboxMenu";
import { getInventoryRequestDisplayDate } from "../../../utils/inventory-utils";
import { StockRequestWithOptionalExtras } from "@/app/api/inventory/requests/types";

type Props = {
    data?: StockRequestWithOptionalExtras[],
    dataIsLoading: boolean,
    onSortChange?: (sortMode: RequestSortMode) => void,
    onFilterChange?: (filters: StockRequestStatus[]) => void
}

export enum RequestSortMode {
    NEWEST_OLDEST = "Newest - Oldest",
    OLDEST_NEWEST = "Oldest - Newest"
}

export const parseRequestSortMode = (mode: string): RequestSortMode => {
    switch (mode.toLowerCase().replaceAll(" ", "_")) {
        case RequestSortMode.NEWEST_OLDEST.toLowerCase().replaceAll(" ", "_"): {
            return RequestSortMode.NEWEST_OLDEST;
        }
        case RequestSortMode.OLDEST_NEWEST.toLowerCase().replaceAll(" ", "_"): {
            return RequestSortMode.OLDEST_NEWEST;
        }
        default: {
            return RequestSortMode.NEWEST_OLDEST;
        }
    }
}

const useMutableRequests = ({ data, dataIsLoading, onFilterChange, onSortChange }: Props) => {
    const [visibleRequests, setVisibleRequests] = useState(data);
    const [sortMode, setSortMode] = useState<RequestSortMode>(RequestSortMode.NEWEST_OLDEST);
    const [filters, setFilters] = useState<StockRequestStatus[]>([]);

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
                        return new Date(getInventoryRequestDisplayDate(b)).getTime() - new Date(getInventoryRequestDisplayDate(a)).getTime();
                    }
                    case RequestSortMode.OLDEST_NEWEST.toLowerCase(): {
                        return new Date(getInventoryRequestDisplayDate(a)).getTime() - new Date(getInventoryRequestDisplayDate(b)).getTime();
                    }
                    default: {
                        return new Date(getInventoryRequestDisplayDate(b)).getTime() - new Date(getInventoryRequestDisplayDate(a)).getTime();
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

    const sortButton = useMemo(() => (
        <DropdownInput
            labelIsIcon
            icon={<SortIcon />}
            variant="flat"
            selectionRequired
            keys={[RequestSortMode.NEWEST_OLDEST, RequestSortMode.OLDEST_NEWEST]}
            selectedKeys={sortMode ? [sortMode] : []}
            setSelectedKeys={(keys) => {
                const newSortMode = parseRequestSortMode(Array.from(keys)[0] as string);
                setSortMode(newSortMode)
                onSortChange?.(newSortMode);
            }}
        />
    ), [onSortChange, sortMode]);

    const filterButton = useMemo(() => (
        <CheckboxMenu
            buttonProps={{
                children: <FilterIcon />
            }}
            checkboxGroupProps={{
                label: "Filter",
                value: filters,
                onValueChange(value) {
                    const newFilters = value as StockRequestStatus[];
                    setFilters(newFilters);
                    onFilterChange?.(newFilters);
                }
            }}
        >
            <Checkbox
                icon={<PendingIcon />}
                color="default"
                value={StockRequestStatus.PENDING}
            >Pending</Checkbox>
            <Checkbox
                color="warning"
                icon={<DeliveredIcon />}
                value={StockRequestStatus.PARTIALLY_DELIVERED}
            >Partially Delivered</Checkbox>
            <Checkbox
                color="success"
                icon={<DeliveredIcon />}
                value={StockRequestStatus.DELIVERED}
            >Delivered</Checkbox>
            <Checkbox
                color="danger"
                icon={<DeniedIcon />}
                value={StockRequestStatus.REJECTED}
            >Rejected</Checkbox>
        </CheckboxMenu>
    ), [filters, onFilterChange]);

    return { visibleRequests, sortMode, setSortMode, filters, setFilters, sortButton, filterButton };
};

export default useMutableRequests;