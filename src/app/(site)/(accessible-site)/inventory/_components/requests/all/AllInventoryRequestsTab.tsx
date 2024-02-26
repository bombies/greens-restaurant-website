"use client"

import React, { FC, Fragment, useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { fetcher } from "../../../../employees/_components/EmployeeGrid";
import InventoryRequestCard from "../InventoryRequestCard";
import { Divider } from "@nextui-org/divider";
import GenericCard from "../../../../../../_components/GenericCard";
import SubTitle from "../../../../../../_components/text/SubTitle";
import useMutableRequests, { RequestSortMode } from "../hooks/useMutableRequests";
import { useUserData } from "../../../../../../../utils/Hooks";
import { hasAnyPermission, Permission } from "../../../../../../../libs/types/permission";
import { useRouter } from "next/navigation";
import GenericButton from "@/app/_components/inputs/GenericButton";
import { LoaderIcon } from "lucide-react";
import { Spacer, Spinner } from "@nextui-org/react";
import useAsyncChunkedItems from "@/app/_components/hooks/useAsyncChunkedItems";
import { StockRequestWithOptionalExtras } from "@/app/api/inventory/requests/types";
import CardSkeleton from "@/app/_components/skeletons/CardSkeleton";
import { StockRequestStatus } from "@prisma/client";
import { list } from "postcss";

type FetchAllRequestArgs = {
    withAssignees?: boolean,
    withLocation?: boolean,
    doFetch?: boolean
}

export const FetchAllRequests = (args?: FetchAllRequestArgs) => {
    return useSWR((args?.doFetch || args?.doFetch === undefined) && `/api/inventory/requests?with_users=true&with_assignees=${args?.withAssignees ?? false}&with_location=${args?.withLocation ?? false}`, fetcher<StockRequestWithOptionalExtras[]>);
};

type Props = {
    userPermissions: number
}

const AllInventoryRequestsPage: FC<Props> = ({ userPermissions }) => {

    const router = useRouter()
    const canView = useMemo(() => hasAnyPermission(userPermissions, [
        Permission.MANAGE_STOCK_REQUESTS, Permission.VIEW_STOCK_REQUESTS
    ]), [userPermissions]);

    const {
        list: loadedRequests,
        hasMoreToLoad,
        isLoading: itemsLoading,
        initialItemsLoading,
        reloadWithParams
    } = useAsyncChunkedItems<StockRequestWithOptionalExtras>("/api/inventory/requests", 20, {
        'with_assignees': "true",
        'with_location': "true",
        'with_users': "true",
        'sort': "desc",
    });

    const { sortButton, filterButton } = useMutableRequests({
        data: loadedRequests.items ?? [],
        dataIsLoading: itemsLoading,
        onSortChange(sortMode) {
            reloadWithParams({ sort: sortMode === RequestSortMode.NEWEST_OLDEST ? "desc" : "asc" });
        },
        onFilterChange(filters) {
            reloadWithParams({ status: filters.join(",") });
        }
    });


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
        if (!canView)
            router.replace("/inventory/requests")
    }, [canView, router]);

    return (
        canView && (
            <Fragment>

                <div className="flex items-center gap-4">
                    {sortButton}
                    {filterButton}
                </div>
                <Divider className="my-6" />
                {
                    initialItemsLoading ? (
                        <div className="grid grid-cols-2 tablet:grid-cols-1 gap-4">
                            <CardSkeleton contentRepeat={3} />
                            <CardSkeleton contentRepeat={3} />
                            <CardSkeleton contentRepeat={3} />
                            <CardSkeleton contentRepeat={3} />
                            <CardSkeleton contentRepeat={3} />
                            <CardSkeleton contentRepeat={3} />
                        </div>
                    ) :
                        requestCards.length || itemsLoading ?
                            <>
                                <div className="grid grid-cols-2 tablet:grid-cols-1 gap-4">
                                    {requestCards}
                                </div>

                                {itemsLoading ? (
                                    <div className="flex justify-center">
                                        <Spinner size="lg" />
                                    </div>
                                ) : (hasMoreToLoad && (
                                    <>
                                        <Spacer y={6} />
                                        <div className="flex w-full justify-center">
                                            <GenericButton
                                                isLoading={itemsLoading}
                                                isDisabled={itemsLoading}
                                                startContent={<LoaderIcon />}
                                                onPress={loadedRequests.loadMore}
                                                variant="flat"
                                            >Load More</GenericButton>
                                        </div>
                                    </>
                                ))}
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