import React, { FC, Fragment, useMemo } from "react";
import useSWR from "swr";
import { fetcher } from "../../../../employees/_components/EmployeeGrid";
import { StockRequestWithOptionalCreator } from "../inventory-requests-utils";
import InventoryRequestCard from "../InventoryRequestCard";
import { Divider } from "@nextui-org/divider";
import GenericCard from "../../../../../../_components/GenericCard";
import SubTitle from "../../../../../../_components/text/SubTitle";
import useMutableRequests, { RequestSortMode } from "../hooks/useMutableRequests";
import CardSkeleton from "../../../../../../_components/skeletons/CardSkeleton";
import DropdownInput from "../../../../../../_components/inputs/DropdownInput";
import SortIcon from "../../../../../../_components/icons/SortIcon";
import CheckboxMenu from "../../../../../../_components/CheckboxMenu";
import FilterIcon from "../../../../../../_components/icons/FilterIcon";
import { StockRequestStatus } from ".prisma/client";
import { Checkbox } from "@nextui-org/react";
import PendingIcon from "../../../../../../_components/icons/PendingIcon";
import DeliveredIcon from "../../../../../../_components/icons/DeliveredIcon";
import DeniedIcon from "../../../../../../_components/icons/DeniedIcon";

const FetchAllRequests = (withAssignees?: boolean) => {
    return useSWR(`/api/inventory/requests?with_users=true&with_assignees=${withAssignees ?? false}`, fetcher<StockRequestWithOptionalCreator[]>);
};

const AllInventoryRequestsTab: FC = () => {
    const { data, isLoading } = FetchAllRequests(true);
    const { visibleRequests, sortMode, setSortMode, filters, setFilters } = useMutableRequests({
        data, dataIsLoading: isLoading
    });
    const requestCards = useMemo(() => {
        return visibleRequests
            ?.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .map(req => (
                <InventoryRequestCard
                    key={req.id}
                    request={req}
                    showRequester
                />
            )) ?? [];
    }, [visibleRequests]);

    return (
        <Fragment>
            <div className="flex items-center gap-4">
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
                            <SubTitle>There are no requests</SubTitle>
                        </GenericCard>
            }
        </Fragment>
    );
};

export default AllInventoryRequestsTab;