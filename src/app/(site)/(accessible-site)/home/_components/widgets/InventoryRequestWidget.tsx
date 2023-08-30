"use client";

import React, { FC, Fragment, useMemo } from "react";
import { FetchAllRequests } from "../../../inventory/_components/requests/all/AllInventoryRequestsTab";
import { Spinner } from "@nextui-org/spinner";
import { Divider } from "@nextui-org/divider";
import useMutableRequests from "../../../inventory/_components/requests/hooks/useMutableRequests";
import LinkCard from "../../../../../_components/LinkCard";
import SubTitle from "../../../../../_components/text/SubTitle";
import { getStatusChip } from "../../../inventory/_components/hooks/useRequestStatus";

const InventoryRequestWidget: FC = () => {
    const { data, isLoading } = FetchAllRequests(true);
    const {
        visibleRequests,
        sortButton, filterButton
    } = useMutableRequests({
        data, dataIsLoading: isLoading
    });
    const cards = useMemo(() => visibleRequests
            ?.map(request => (
                <LinkCard key={request.id} href={`/inventory/requests/${request.id}`}>
                    <div className="block">
                        <SubTitle className="!text-sm" thick>
                            {
                                `Request for ${new Date(request.createdAt).toLocaleDateString("en-JM")} @ ${new Date(request.createdAt).toLocaleTimeString("en-JM", {
                                    timeZone: "EST",
                                    timeStyle: "short"
                                })}`
                            }
                        </SubTitle>
                        <Divider className="my-2" />
                        {getStatusChip(request)}
                    </div>
                </LinkCard>
            ))
        , [visibleRequests]);

    return (
        <div className="default-container backdrop-blur-md pt-6 px-6 pb-12 w-96 h-96 phone:w-full">
            {
                isLoading ?
                    <div className="flex justify-center items-center"><Spinner size="lg" /></div>
                    :
                    <Fragment>
                        <h3 className="font-black text-lg text-primary capitalize mb-4">
                            Inventory Requests
                        </h3>
                        <Divider className="mb-3" />
                        <div className="flex items-center gap-4">
                            {sortButton}
                            {filterButton}
                        </div>
                        <Divider className="my-3" />
                        <div className="space-y-3 overflow-y-auto h-3/4 p-2">
                            {cards}
                        </div>
                    </Fragment>
            }
        </div>
    );
};

export default InventoryRequestWidget;