"use client";

import { FC, Fragment } from "react";
import { Divider } from "@nextui-org/divider";
import UserAvatar from "../../../../../../_components/UserAvatar";
import { InventoryRequestDetails } from "../../../_components/requests/InventoryRequestCard";
import ContainerSkeleton from "app/_components/skeletons/ContainerSkeleton";
import { StockRequestWithOptionalExtras } from "@/app/api/inventory/requests/types";

type Props = {
    request?: StockRequestWithOptionalExtras,
    requestIsLoading: boolean,
}

const SpecificInventoryRequestInformation: FC<Props> = ({ request }) => {
    return !request ? (
        <ContainerSkeleton width="35rem" />
    ) : (
        <div className="default-container p-6 mt-6 w-[35rem]">
            <InventoryRequestDetails request={request} showRequester>
                {
                    request.reviewedByUser ?
                        <Fragment>
                            <Divider orientation="vertical" />
                            <div className="self-center">
                                <p className="uppercase self-center font-semibold text-xs mb-3">Reviewed
                                    By</p>
                                <UserAvatar user={request?.reviewedByUser} isBordered showToolTip />
                            </div>
                        </Fragment>
                        : undefined
                }
            </InventoryRequestDetails>
        </div>
    );
};

export default SpecificInventoryRequestInformation;