"use client";

import React, { FC, Fragment, useMemo } from "react";
import { Spinner } from "@nextui-org/spinner";
import { Divider } from "@nextui-org/divider";
import useMutableRequests, { RequestSortMode } from "../../../inventory/_components/requests/hooks/useMutableRequests";
import LinkCard from "../../../../../_components/LinkCard";
import SubTitle from "../../../../../_components/text/SubTitle";
import { getStatusChip } from "../../../inventory/_components/hooks/useRequestStatus";
import { getInventoryRequestDisplayDate } from "app/(site)/(accessible-site)/inventory/utils/inventory-utils";
import useAsyncChunkedItems from "@/app/_components/hooks/useAsyncChunkedItems";
import { StockRequestWithOptionalExtras } from "@/app/api/inventory/requests/types";
import useInfiniteScroll from "react-infinite-scroll-hook";
import { Spacer } from "@nextui-org/react";
import WidgetContainer from "./WidgetContainer";

const InventoryRequestWidget: FC = () => {
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

    const {
        sortButton, filterButton
    } = useMutableRequests({
        data: loadedRequests.items ?? [],
        dataIsLoading: itemsLoading,
        onSortChange(sortMode) {
            reloadWithParams({ sort: sortMode === RequestSortMode.NEWEST_OLDEST ? "desc" : "asc" });
        },
        onFilterChange(filters) {
            reloadWithParams({ status: filters.length ? filters.join(",") : undefined });
        }
    });

    const cards = useMemo(() => loadedRequests
        .items
        ?.map(request => {
            const displayDate = getInventoryRequestDisplayDate(request)
            return (
                <LinkCard key={request.id} href={`/inventory/requests/${request.id}`}>
                    <div className="block">
                        <SubTitle className="!text-sm" thick>
                            {
                                `Request for ${new Date(displayDate).toLocaleDateString("en-JM")} @ ${new Date(displayDate).toLocaleTimeString("en-JM", {
                                    timeZone: "EST",
                                    timeStyle: "short"
                                })}`
                            }
                        </SubTitle>
                        <Divider className="my-2" />
                        {getStatusChip(request.status)}
                    </div>
                </LinkCard>
            )
        }), [loadedRequests.items]);

    const [scrollContainerRef] = useInfiniteScroll({
        onLoadMore: loadedRequests.loadMore,
        loading: itemsLoading,
        hasNextPage: hasMoreToLoad,
    })

    return (
        <WidgetContainer>
            <h3 className="font-black text-lg text-primary capitalize mb-4">
                Inventory Requests
            </h3>
            {
                initialItemsLoading ?
                    <div className="flex justify-center items-center w-full h-full"><Spinner size="lg" /></div>
                    :
                    <Fragment>
                        <Divider className="mb-3" />
                        <div className="flex items-center gap-4">
                            {sortButton}
                            {filterButton}
                        </div>
                        <Divider className="my-3" />
                        <div className="space-y-3 overflow-y-auto h-3/4 p-2">
                            {cards}
                            {hasMoreToLoad && (
                                <>
                                    <Spacer y={6} />
                                    <div
                                        ref={scrollContainerRef}
                                        className="flex w-full justify-center"
                                    >
                                        <Spinner size="sm" />
                                    </div>
                                </>
                            )}
                        </div>
                    </Fragment>
            }
        </WidgetContainer>
    );
};

export default InventoryRequestWidget;