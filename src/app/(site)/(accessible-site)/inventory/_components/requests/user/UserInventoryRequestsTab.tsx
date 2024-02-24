"use client";

import React, { FC, useMemo } from "react";
import { Divider } from "@nextui-org/divider";
import CreateNewInventoryRequestButton from "./CreateNewInventoryRequestButton";
import TriggerRequestCreationProvider from "./TriggerRequestCreationProvider";
import InventoryRequestCard from "../InventoryRequestCard";
import GenericCard from "../../../../../../_components/GenericCard";
import SubTitle from "../../../../../../_components/text/SubTitle";
import useMutableRequests from "../hooks/useMutableRequests";
import { StockRequestWithOptionalExtras } from "@/app/api/inventory/requests/types";
import useAsyncChunkedItems from "@/app/_components/hooks/useAsyncChunkedItems";
import GenericButton from "@/app/_components/inputs/GenericButton";
import { Spacer, Spinner } from "@nextui-org/react";
import { LoaderIcon } from "lucide-react";
import CardSkeleton from "@/app/_components/skeletons/CardSkeleton";

const UserInventoryRequestsPage: FC = () => {
    const {
        list: data,
        initialItemsLoading,
        hasMoreToLoad,
        isLoading
    } = useAsyncChunkedItems<StockRequestWithOptionalExtras>("/api/inventory/requests/me", 20, {
        [`with_assignees`]: "true",
        [`with_location`]: "true",
        [`with_users`]: "true"
    });

    const { visibleRequests, sortButton, filterButton } = useMutableRequests({
        data: data.items ?? [], dataIsLoading: isLoading
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
                <CreateNewInventoryRequestButton
                    onRequestCreate={data.prepend}
                />
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
                    requestCards.length ?
                        <>
                            <div className="grid grid-cols-2 tablet:grid-cols-1 gap-4">
                                {requestCards}
                            </div>

                            {isLoading ? (
                                <div className="flex justify-center">
                                    <Spinner size="lg" />
                                </div>
                            ) : (hasMoreToLoad && (
                                <>
                                    <Spacer y={6} />
                                    <div className="flex w-full justify-center">
                                        <GenericButton
                                            isLoading={isLoading}
                                            isDisabled={isLoading}
                                            startContent={<LoaderIcon />}
                                            onPress={data.loadMore}
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
        </TriggerRequestCreationProvider>
    );
};

export default UserInventoryRequestsPage;