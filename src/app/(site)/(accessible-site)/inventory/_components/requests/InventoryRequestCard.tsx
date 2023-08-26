"use client";

import { FC, Fragment } from "react";
import LinkCard from "../../../../../_components/LinkCard";
import { Divider } from "@nextui-org/divider";
import SubTitle from "../../../../../_components/text/SubTitle";
import { StockRequestWithOptionalCreatorAndAssignees } from "./inventory-requests-utils";
import { AvatarGroup, User } from "@nextui-org/react";
import useAssigneeAvatars from "../hooks/useAssigneeAvatars";
import useRequestStatus from "../hooks/useRequestStatus";

interface Props {
    request: StockRequestWithOptionalCreatorAndAssignees;
    showRequester?: boolean,
}

const InventoryRequestCard: FC<Props> = ({ request, showRequester }) => {
    const { assigneeAvatars, avatars } = useAssigneeAvatars(request);
    const requestStatusChip = useRequestStatus(request);
    return (
        <LinkCard
            href={`/inventory/requests/${request.id}`}
            className="!block"
        >
            <SubTitle className="!text-medium tablet:!text-sm !break-all" thick>
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
                        description="made this request"
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
                assigneeAvatars?.length ?
                    <Fragment>
                        <Divider className="my-6" />
                        <p className="uppercase font-semibold text-xs mb-3 mt-6">Assigned To</p>
                        <AvatarGroup className="justify-start" isBordered>
                            {assigneeAvatars}
                        </AvatarGroup>
                    </Fragment>
                    : undefined
            }
        </LinkCard>
    );
};

export default InventoryRequestCard;