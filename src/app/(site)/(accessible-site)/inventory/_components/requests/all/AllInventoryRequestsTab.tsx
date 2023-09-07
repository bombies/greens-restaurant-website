import React, { FC, Fragment, useMemo } from "react";
import useSWR from "swr";
import { fetcher } from "../../../../employees/_components/EmployeeGrid";
import { StockRequestWithOptionalCreator } from "../inventory-requests-utils";
import InventoryRequestCard from "../InventoryRequestCard";
import { Divider } from "@nextui-org/divider";
import GenericCard from "../../../../../../_components/GenericCard";
import SubTitle from "../../../../../../_components/text/SubTitle";
import useMutableRequests from "../hooks/useMutableRequests";
import CardSkeleton from "../../../../../../_components/skeletons/CardSkeleton";

export const FetchAllRequests = (withAssignees?: boolean) => {
    return useSWR(`/api/inventory/requests?with_users=true&with_assignees=${withAssignees ?? false}`, fetcher<StockRequestWithOptionalCreator[]>);
};

const AllInventoryRequestsTab: FC = () => {
    const { data, isLoading } = FetchAllRequests(true);
    const { visibleRequests, sortButton, filterButton } = useMutableRequests({
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
                {sortButton}
                {filterButton}
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