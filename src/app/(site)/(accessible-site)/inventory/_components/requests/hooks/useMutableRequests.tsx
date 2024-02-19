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
    }, [sortMode, filters, data, getInventoryRequestDisplayDate]);

    const sortButton = useMemo(() => (
        <DropdownInput
            labelIsIcon
            icon={<SortIcon />}
            variant="flat"
            selectionRequired
            keys={[RequestSortMode.NEWEST_OLDEST, RequestSortMode.OLDEST_NEWEST]}
            selectedKeys={sortMode ? [sortMode] : []}
            setSelectedKeys={(keys) => setSortMode((Array.from(keys)[0] as RequestSortMode))}
        />
    ), [sortMode]);

    const filterButton = useMemo(() => (
        <CheckboxMenu
            buttonProps={{
                children: <FilterIcon />
            }}
            checkboxGroupProps={{
                label: "Filter",
                value: filters,
                onValueChange(value) {
                    setFilters(value as StockRequestStatus[]);
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
    ), [filters]);

    return { visibleRequests, sortMode, setSortMode, filters, setFilters, sortButton, filterButton };
};

export default useMutableRequests;