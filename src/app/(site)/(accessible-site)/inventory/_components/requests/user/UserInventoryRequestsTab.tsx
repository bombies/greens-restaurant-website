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
import useMutableRequests from "../hooks/useMutableRequests";

const FetchUserRequests = (withAssignees?: boolean) => {
    return useSWR(`/api/inventory/requests/me?with_users=true&with_assignees=${withAssignees ?? false}`, fetcher<StockRequestWithOptionalCreatorAndAssignees[]>);
};

const UserInventoryRequestsPage: FC = () => {
    const { data, isLoading, mutate } = FetchUserRequests(true);
    const { visibleRequests, sortButton, filterButton } = useMutableRequests({
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
                            <SubTitle>You have no requests</SubTitle>
                        </GenericCard>
            }
        </TriggerRequestCreationProvider>
    );
};

export default UserInventoryRequestsPage;