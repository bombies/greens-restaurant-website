import { FC, Fragment, useMemo } from "react";
import useSWR from "swr";
import { fetcher } from "../../../../employees/_components/EmployeeGrid";
import { StockRequestWithOptionalCreator } from "../inventory-requests-utils";
import InventoryRequestCard from "../InventoryRequestCard";
import { Spinner } from "@nextui-org/spinner";
import { Divider } from "@nextui-org/divider";
import GenericCard from "../../../../../../_components/GenericCard";
import SubTitle from "../../../../../../_components/text/SubTitle";

const FetchAllRequests = (withAssignees?: boolean) => {
    return useSWR(`/api/inventory/requests?with_users=true&with_assignees=${withAssignees ?? false}`, fetcher<StockRequestWithOptionalCreator[]>);
};

const AllInventoryRequestsTab: FC = () => {
    const { data, isLoading, mutate } = FetchAllRequests(true);
    const requestCards = useMemo(() => {
        return data
            ?.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .map(req => (
                <InventoryRequestCard
                    key={req.id}
                    request={req}
                    showRequester
                />
            )) ?? [];
    }, [data]);

    return (
        <Fragment>
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
                            <SubTitle>There are no requests</SubTitle>
                        </GenericCard>
            }
        </Fragment>
    );
};

export default AllInventoryRequestsTab;