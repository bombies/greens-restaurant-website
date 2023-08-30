"use client";

import React, { FC, useMemo } from "react";
import useSWR from "swr";
import { fetcher } from "../../../../employees/_components/EmployeeGrid";
import {
    StockRequestWithOptionalCreatorAndAssignees
} from "../inventory-requests-utils";
import { Divider } from "@nextui-org/divider";
import CreateNewInventoryRequestButton from "./CreateNewInventoryRequestButton";
import TriggerRequestCreationProvider from "./TriggerRequestCreationProvider";
import InventoryRequestCard from "../InventoryRequestCard";
import GenericCard from "../../../../../../_components/GenericCard";
import SubTitle from "../../../../../../_components/text/SubTitle";
import CardSkeleton from "../../../../../../_components/skeletons/CardSkeleton";
import useMutableRequests, { RequestSortMode } from "../hooks/useMutableRequests";
import SortIcon from "../../../../../../_components/icons/SortIcon";
import FilterIcon from "../../../../../../_components/icons/FilterIcon";
import DropdownInput from "../../../../../../_components/inputs/DropdownInput";
import { Checkbox } from "@nextui-org/react";
import CheckboxMenu from "../../../../../../_components/CheckboxMenu";
import { StockRequestStatus } from ".prisma/client";
import PendingIcon from "../../../../../../_components/icons/PendingIcon";
import DeliveredIcon from "../../../../../../_components/icons/DeliveredIcon";
import DeniedIcon from "../../../../../../_components/icons/DeniedIcon";

const FetchUserRequests = (withAssignees?: boolean) => {
    return useSWR(`/api/inventory/requests/me?with_users=true&with_assignees=${withAssignees ?? false}`, fetcher<StockRequestWithOptionalCreatorAndAssignees[]>);
};

const UserInventoryRequestsTab: FC = () => {
    const { data, isLoading, mutate } = FetchUserRequests(true);
    const { visibleRequests, sortMode, setSortMode, filters, setFilters } = useMutableRequests({
        data, dataIsLoading: isLoading
    });
    const requestCards = useMemo(() => {
        return visibleRequests
            ?.map(req => (
                <InventoryRequestCard key={req.id} request={req} />
            )) ?? [];
    }, [visibleRequests]);

    return (
        <TriggerRequestCreationProvider>
            <div className="flex items-center gap-4">
                <CreateNewInventoryRequestButton mutator={mutate} visibleData={data} />
                <DropdownInput
                    labelIsIcon
                    icon={<SortIcon />}
                    variant="flat"
                    selectionRequired
                    keys={[RequestSortMode.NEWEST_OLDEST, RequestSortMode.OLDEST_NEWEST]}
                    selectedKeys={sortMode ? [sortMode] : []}
                    setSelectedKeys={(keys) => setSortMode((Array.from(keys)[0] as RequestSortMode))}
                />
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
            </div>
            <Divider className="my-6" />
            {
                isLoading ?
                    <div className="grid grid-cols-2 tablet:grid-cols-1 gap-4">
                        <CardSkeleton contentRepeat={3} />
                        <CardSkeleton contentRepeat={3} />
                        <CardSkeleton contentRepeat={3} />
                        <CardSkeleton contentRepeat={3} />
                        <CardSkeleton contentRepeat={3} />
                        <CardSkeleton contentRepeat={3} />
                    </div>
                    :
                    requestCards.length ?
                        <div className="grid grid-cols-2 tablet:grid-cols-1 gap-4">
                            {requestCards}
                        </div>
                        :
                        <GenericCard>
                            <SubTitle>You have no requests</SubTitle>
                        </GenericCard>
            }
        </TriggerRequestCreationProvider>
    );
};

export default UserInventoryRequestsTab;