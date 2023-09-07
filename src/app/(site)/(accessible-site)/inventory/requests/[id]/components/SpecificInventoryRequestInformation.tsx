"use client";

import { FC, Fragment } from "react";
import { StockRequestWithOptionalExtras } from "../../../_components/requests/inventory-requests-utils";
import { Spinner } from "@nextui-org/spinner";
import { Divider } from "@nextui-org/divider";
import useAssigneeAvatars from "../../../_components/hooks/useAssigneeAvatars";
import { AvatarGroup, Spacer, User } from "@nextui-org/react";
import useRequestStatus from "../../../_components/hooks/useRequestStatus";

type Props = {
    request?: StockRequestWithOptionalExtras,
    requestIsLoading: boolean,
}

const SpecificInventoryRequestInformation: FC<Props> = ({ request, requestIsLoading }) => {
    const { assigneeAvatars, avatars } = useAssigneeAvatars(request);
    const requestStatusChip = useRequestStatus(request);

    return (
        <div className="default-container p-6 mt-6 w-fit">
            {
                requestIsLoading ?
                    <Spinner size="md" />
                    :
                    <Fragment>
                        <p className="text-primary font-semibold text-2xl phone:text-medium">
                            {`Request for ${new Date(request?.createdAt ?? "").toLocaleDateString("en-JM")} @ ${new Date(request?.createdAt ?? "").toLocaleTimeString("en-JM", {
                                timeZone: "EST",
                                timeStyle: "short"
                            })}`}
                        </p>
                        <Spacer y={3} />
                        {requestStatusChip}
                        <Divider className="mt-6 mb-4" />
                        <div className="flex justify-between h-20">
                            <div className="self-center">
                                <div className="flex mt-4">
                                    <User
                                        name={`${request?.requestedByUser?.firstName} ${request?.requestedByUser?.lastName}`}
                                        description="made this request"
                                        classNames={{
                                            base: "space-x-4",
                                            name: "font-semibold text-primary"
                                        }}
                                        avatarProps={{
                                            isBordered: true,
                                            src: avatars?.find(userAvatar => userAvatar.userId === request?.requestedByUser?.id)?.avatar
                                                || (request?.requestedByUser?.image || undefined)
                                        }}
                                    />
                                </div>
                            </div>
                            {
                                assigneeAvatars?.length ?
                                    <Fragment>
                                        <Divider orientation="vertical" />
                                        <div className="self-center">
                                            <p className="uppercase self-center font-semibold text-xs mb-3">Assigned
                                                To</p>
                                            <AvatarGroup isBordered>
                                                {assigneeAvatars}
                                            </AvatarGroup>
                                        </div>
                                    </Fragment>
                                    : undefined
                            }
                        </div>
                    </Fragment>
            }
        </div>
    );
};

export default SpecificInventoryRequestInformation;