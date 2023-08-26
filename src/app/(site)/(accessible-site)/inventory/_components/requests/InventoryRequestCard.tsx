"use client";

import { FC, Fragment, useEffect, useMemo } from "react";
import LinkCard from "../../../../../_components/LinkCard";
import { Divider } from "@nextui-org/divider";
import SubTitle from "../../../../../_components/text/SubTitle";
import { Chip } from "@nextui-org/chip";
import PendingIcon from "../../../../../_components/icons/PendingIcon";
import DeliveredIcon from "../../../../../_components/icons/DeliveredIcon";
import DeniedIcon from "../../../../../_components/icons/DeniedIcon";
import { StockRequestWithOptionalCreatorAndAssignees } from "./inventory-requests-utils";
import { Avatar } from "@nextui-org/avatar";
import { useS3AvatarUrls } from "../../../../../_components/hooks/useS3Base64String";
import { AvatarGroup, Tooltip, User } from "@nextui-org/react";
import { StockRequestStatus } from ".prisma/client";

interface Props {
    request: StockRequestWithOptionalCreatorAndAssignees;
    showRequester?: boolean,
}

const InventoryRequestCard: FC<Props> = ({ request, showRequester }) => {
    const avatarsToLookup = useMemo(() => request.assignedToUsers ?? [], [request.assignedToUsers]);
    useEffect(() => {
        if (request.requestedByUser && !avatarsToLookup.find(user => user.id === request.requestedByUser?.id))
            avatarsToLookup.push(request.requestedByUser);
    }, [avatarsToLookup, request.requestedByUser]);

    const { avatars } = useS3AvatarUrls(avatarsToLookup);
    const assigneeAvatars = useMemo(() => {
        return request.assignedToUsers
            ?.filter(user => request.assignedToUsersId.includes(user.id))
            .map(assignee => {
                return (
                    <Tooltip
                        key={assignee.id}
                        content={<p className="capitalize">{assignee.firstName} {assignee.lastName}</p>}
                        closeDelay={10}
                    >
                        <Avatar
                            src={avatars?.find(userAvatar => userAvatar.userId === assignee.id)?.avatar
                                || (assignee.image || undefined)}
                        />
                    </Tooltip>
                );
            });
    }, [avatars, request.assignedToUsers, request.assignedToUsersId]);

    const requestStatusChip = useMemo(() => {
        switch (request.status) {
            case StockRequestStatus.DELIVERED: {
                return (
                    <Chip
                        variant="flat"
                        color="success"
                        classNames={{
                            content: "font-semibold"
                        }}
                        startContent={<DeliveredIcon width={16} />}
                    >
                        DELIVERED
                    </Chip>
                );
            }
            case StockRequestStatus.PARTIALLY_DELIVERED: {
                return (
                    <Chip
                        variant="flat"
                        color="warning"
                        classNames={{
                            content: "font-semibold"
                        }}
                        startContent={<DeliveredIcon width={16} />}
                    >
                        PARTIALLY DELIVERED
                    </Chip>
                );
            }
            case StockRequestStatus.REJECTED: {
                return (
                    <Chip
                        variant="flat"
                        color="danger"
                        classNames={{
                            content: "font-semibold"
                        }}
                        startContent={<DeniedIcon width={16} />}
                    >
                        REJECTED
                    </Chip>
                );
            }
            case StockRequestStatus.PENDING: {
                return (
                    <Chip
                        variant="flat"
                        classNames={{
                            content: "font-semibold"
                        }}
                        startContent={<PendingIcon width={16} />}
                    >
                        PENDING
                    </Chip>
                );
            }
        }
    }, [request.status]);

    return (
        <LinkCard
            href={`/inventory/requests/${request.id}`}
            className="!block"
        >
            <SubTitle className="!text-medium tablet:!text-sm" thick>
                {
                    `Request for ${new Date(request.createdAt).toLocaleDateString("en-JM")} @ ${new Date(request.createdAt).toLocaleTimeString("en-JM", {
                        timeZone: "EST",
                        timeStyle: "short"
                    })}`
                }
            </SubTitle>
            <Divider className="my-6" />
            {requestStatusChip}
            {
                showRequester &&
                <div className="flex mt-4">
                    <User
                        name={`${request.requestedByUser?.firstName} ${request.requestedByUser?.lastName}`}
                        description="made this request."
                        classNames={{
                            base: "space-x-4",
                            name: "font-semibold text-primary"
                        }}
                        avatarProps={{
                            isBordered: true,
                            src: avatars?.find(userAvatar => userAvatar.userId === request.requestedByUser?.id)?.avatar
                                || (request.requestedByUser?.image || undefined)
                        }}
                    />
                </div>
            }
            {
                assigneeAvatars?.length &&
                <Fragment>
                    <Divider className="my-6" />
                    <p className="uppercase font-semibold text-xs mb-3 mt-6">Assigned To</p>
                    <AvatarGroup className="justify-start" isBordered>
                        {assigneeAvatars}
                    </AvatarGroup>
                </Fragment>
            }
        </LinkCard>
    );
};

export default InventoryRequestCard;