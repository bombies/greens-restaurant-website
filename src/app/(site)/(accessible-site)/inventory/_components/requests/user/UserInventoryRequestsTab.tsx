"use client";

import { FC, Fragment, useMemo } from "react";
import useSWR from "swr";
import { Spinner } from "@nextui-org/spinner";
import { fetcher } from "../../../../employees/_components/EmployeeGrid";
import { StockRequestWithOptionalCreator } from "../inventory-requests-utils";
import { Divider } from "@nextui-org/divider";
import GenericButton from "../../../../../../_components/inputs/GenericButton";
import CreateNewInventoryRequestButton from "./CreateNewInventoryRequestButton";
import TriggerRequestCreationProvider from "./TriggerRequestCreationProvider";
import InventoryRequestCard from "../InventoryRequestCard";
import { sort } from "next/dist/build/webpack/loaders/css-loader/src/utils";

const FetchUserRequests = () => {
    return useSWR("/api/inventory/requests/me?with_users=true", fetcher<StockRequestWithOptionalCreator[]>);
};

const UserInventoryRequestsTab: FC = () => {
    const { data, isLoading, mutate } = FetchUserRequests();
    const requestCards = useMemo(() => {
        return data
            ?.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .map(req => (
                <InventoryRequestCard key={req.id} request={req} />
            )) ?? [];
    }, [data]);

    return (
        <TriggerRequestCreationProvider>
            <CreateNewInventoryRequestButton />
            <Divider className="my-6" />
            {
                isLoading ?
                    <Spinner size="lg" />
                    :
                    <div className="grid grid-cols-3 tablet:grid-cols-2 phone:grid-cols-1 gap-4">
                        {requestCards}
                    </div>
            }
        </TriggerRequestCreationProvider>
    );
};

export default UserInventoryRequestsTab;