"use client";

import { FC, Fragment } from "react";
import useSWR from "swr";
import { Spinner } from "@nextui-org/spinner";
import { fetcher } from "../../../../employees/_components/EmployeeGrid";
import { StockRequestWithOptionalCreator } from "../inventory-requests-utils";
import { Divider } from "@nextui-org/divider";
import GenericButton from "../../../../../../_components/inputs/GenericButton";
import CreateNewInventoryRequestButton from "./CreateNewInventoryRequestButton";
import TriggerRequestCreationProvider from "./TriggerRequestCreationProvider";

const FetchUserRequests = () => {
    return useSWR("/api/inventory/requests/me?with_users=true", fetcher<StockRequestWithOptionalCreator[]>);
};

const UserInventoryRequestsTab: FC = () => {
    const { data, isLoading, mutate } = FetchUserRequests();

    return (
        <TriggerRequestCreationProvider>
            <CreateNewInventoryRequestButton />
            <Divider className="my-6" />
            {
                isLoading ?
                    <Spinner size="lg" />
                    :
                    <Fragment>
                        {JSON.stringify(data)}
                    </Fragment>
            }
        </TriggerRequestCreationProvider>
    );
};

export default UserInventoryRequestsTab;