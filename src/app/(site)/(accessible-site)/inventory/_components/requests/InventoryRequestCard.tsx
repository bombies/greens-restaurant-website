"use client";

import { FC, Fragment, useMemo } from "react";
import LinkCard from "../../../../../_components/LinkCard";
import { Divider } from "@nextui-org/divider";
import SubTitle from "../../../../../_components/text/SubTitle";
import { Chip } from "@nextui-org/chip";
import PendingIcon from "../../../../../_components/icons/PendingIcon";
import DeliveredIcon from "../../../../../_components/icons/DeliveredIcon";
import DeniedIcon from "../../../../../_components/icons/DeniedIcon";
import { StockRequestWithOptionalAssignees } from "./inventory-requests-utils";
import { Avatar } from "@nextui-org/avatar";
import { useS3AvatarUrls, useS3Base64AvatarStrings } from "../../../../../_components/hooks/useS3Base64String";
import { AvatarGroup, Spacer } from "@nextui-org/react";

interface Props {
    request: StockRequestWithOptionalAssignees;
}

const InventoryRequestCard: FC<Props> = ({ request }) => {
    const { avatars } = useS3AvatarUrls(request.assignedToUsers ?? []);

    const assigneeAvatars = useMemo(() => {
        return request.assignedToUsers?.map(assignee => {
            return (
                <Avatar
                    key={assignee.id}
                    src={avatars?.find(userAvatar => userAvatar.userId === assignee.id)?.avatar
                        || (assignee.image || undefined)}
                />
            );
        });
    }, [avatars, request.assignedToUsers]);

    return (
        <LinkCard
            href={`/inventory/requests/${request.id}`}
            className="!block"
        >
            <SubTitle className="!text-medium tablet:!text-sm" thick>
                {
                    `Request for ${new Date(request.createdAt).toLocaleDateString()} @ ${new Date(request.createdAt).toLocaleTimeString()}`
                }
            </SubTitle>
            <Divider className="my-6" />
            {
                request.reviewed ?
                    (request.rejected ?
                            <Chip
                                variant="flat"
                                color="danger"
                                classNames={{
                                    content: "font-semibold"
                                }}
                                startContent={<DeniedIcon width={16} />}
                            >REJECTED</Chip>
                            :
                            <Chip
                                variant="flat"
                                color="success"
                                classNames={{
                                    content: "font-semibold"
                                }}
                                startContent={<DeliveredIcon width={16} />}
                            >DELIVERED</Chip>
                    )
                    :
                    <Chip
                        variant="flat"
                        classNames={{
                            content: "font-semibold"
                        }}
                        startContent={<PendingIcon width={16} />}
                    >PENDING</Chip>
            }
            {
                avatars?.length &&
                <Fragment>
                    <Spacer y={3} />
                    <AvatarGroup isBordered>
                        {assigneeAvatars}
                    </AvatarGroup>
                </Fragment>
            }
        </LinkCard>
    );
};

export default InventoryRequestCard;