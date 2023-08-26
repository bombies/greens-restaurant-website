"use client";

import { FC, Fragment, useMemo } from "react";
import useSWR from "swr";
import { Spinner } from "@nextui-org/spinner";
import { fetcher } from "../../../../employees/_components/EmployeeGrid";
import {
    StockRequestWithOptionalCreator,
    StockRequestWithOptionalCreatorAndAssignees
} from "../inventory-requests-utils";
import { Divider } from "@nextui-org/divider";
import GenericButton from "../../../../../../_components/inputs/GenericButton";
import CreateNewInventoryRequestButton from "./CreateNewInventoryRequestButton";
import TriggerRequestCreationProvider from "./TriggerRequestCreationProvider";
import InventoryRequestCard from "../InventoryRequestCard";
import { sort } from "next/dist/build/webpack/loaders/css-loader/src/utils";
import GenericCard from "../../../../../../_components/GenericCard";
import SubTitle from "../../../../../../_components/text/SubTitle";

const FetchUserRequests = (withAssignees?: boolean) => {
    return useSWR(`/api/inventory/requests/me?with_users=true&with_assignees=${withAssignees ?? false}`, fetcher<StockRequestWithOptionalCreatorAndAssignees[]>);
};

const UserInventoryRequestsTab: FC = () => {
    const { data, isLoading, mutate } = FetchUserRequests(true);
    const requestCards = useMemo(() => {
        return data
            ?.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .map(req => (
                <InventoryRequestCard key={req.id} request={req} />
            )) ?? [];
    }, [data]);

    return (
        <TriggerRequestCreationProvider>
            <CreateNewInventoryRequestButton mutator={mutate} visibleData={data} />
            <Divider className="my-6" />
            {
                isLoading ?
                    <Spinner size="lg" />
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