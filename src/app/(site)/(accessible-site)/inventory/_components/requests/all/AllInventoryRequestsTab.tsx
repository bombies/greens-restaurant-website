"use client"

import React, { FC, Fragment, useCallback, useEffect, useMemo } from "react";
import useSWR from "swr";
import { fetcher } from "../../../../employees/_components/EmployeeGrid";
import { StockRequestWithOptionalCreator } from "../inventory-requests-utils";
import InventoryRequestCard from "../InventoryRequestCard";
import { Divider } from "@nextui-org/divider";
import GenericCard from "../../../../../../_components/GenericCard";
import SubTitle from "../../../../../../_components/text/SubTitle";
import useMutableRequests from "../hooks/useMutableRequests";
import CardSkeleton from "../../../../../../_components/skeletons/CardSkeleton";
import { useUserData } from "../../../../../../../utils/Hooks";
import { hasAnyPermission, Permission } from "../../../../../../../libs/types/permission";
import { useRouter } from "next/navigation";
import useLazyChunkedItems from "@/app/_components/hooks/useLazyChunkedItems";
import GenericButton from "@/app/_components/inputs/GenericButton";
import { LoaderIcon } from "lucide-react";
import { Spacer } from "@nextui-org/react";

type FetchAllRequestArgs = {
    withAssignees?: boolean,
    withLocation?: boolean,
    doFetch?: boolean
}

export const FetchAllRequests = (args?: FetchAllRequestArgs) => {
    return useSWR((args?.doFetch || args?.doFetch === undefined) && `/api/inventory/requests?with_users=true&with_assignees=${args?.withAssignees ?? false}&with_location=${args?.withLocation ?? false}`, fetcher<StockRequestWithOptionalCreator[]>);
};

const AllInventoryRequestsPage: FC = () => {
    const router = useRouter()
    const { data: userData, isLoading: userDataLoading } = useUserData();
    const canView = !userDataLoading && hasAnyPermission(userData?.permissions, [
        Permission.MANAGE_STOCK_REQUESTS, Permission.VIEW_STOCK_REQUESTS
    ]);

    const { data, isLoading } = FetchAllRequests({
        withAssignees: true,
        withLocation: true,
        doFetch: true
    });

    const { visibleRequests, sortButton, filterButton } = useMutableRequests({
        data, dataIsLoading: isLoading
    });

    const { loadedItems: loadedRequests, hasMoreToLoad } = useLazyChunkedItems(visibleRequests ?? [], 20);

    const requestCards = useMemo(() => {
        return loadedRequests.items
            ?.map(req => (
                <InventoryRequestCard
                    key={req.id}
                    request={req}
                    showRequester
                />
            )) ?? [];
    }, [loadedRequests.items]);

    useEffect(() => {
        if (!userDataLoading && !canView)
            router.replace("/inventory/requests?requests_tab=my_requests")
    }, [canView, router, userDataLoading]);

    return (
        canView && (
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
                            <>
                                <div className="grid grid-cols-2 tablet:grid-cols-1 gap-4">
                                    {requestCards}
                                </div>
                                {hasMoreToLoad && (
                                    <>
                                        <Spacer y={6} />
                                        <div className="flex w-full justify-center">
                                            <GenericButton
                                                startContent={<LoaderIcon />}
                                                onPress={loadedRequests.loadMore}
                                                variant="flat"
                                            >Load More</GenericButton>
                                        </div>
                                    </>
                                )}
                            </>
                            :
                            <GenericCard>
                                <SubTitle>There are no requests</SubTitle>
                            </GenericCard>
                }
            </Fragment>
        )
    );
};

export default AllInventoryRequestsPage;