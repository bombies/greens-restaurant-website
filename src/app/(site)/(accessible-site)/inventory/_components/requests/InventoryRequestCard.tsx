"use client";

import { FC, Fragment, PropsWithChildren, useMemo } from "react";
import LinkCard from "../../../../../_components/LinkCard";
import { Divider } from "@nextui-org/divider";
import SubTitle from "../../../../../_components/text/SubTitle";
import { StockRequestWithOptionalExtras } from "./inventory-requests-utils";
import { AvatarGroup, Chip, Spacer, User } from "@nextui-org/react";
import useRequestStatus from "../hooks/useRequestStatus";
import { getInventoryRequestDisplayDate } from "../../utils/inventory-utils";
import LocationIcon from "app/_components/icons/LocationIcon";
import UserAvatar from "app/_components/UserAvatar";
import { getUserAvatarString } from "app/(site)/(accessible-site)/employees/employee-utils";

interface Props {
    request: StockRequestWithOptionalExtras;
    showRequester?: boolean,
}

const InventoryRequestCard: FC<Props> = ({ request, showRequester }) => {
    return (
        <LinkCard
            href={`/inventory/requests/${request.id}`}
            className="!block"
        >
            <InventoryRequestDetails request={request} showRequester={showRequester} />
        </LinkCard>
    );
};

export const InventoryRequestDetails: FC<PropsWithChildren<Props>> = ({ request, showRequester, children }) => {
    const requestStatusChip = useRequestStatus(request);
    const displayDate = useMemo(() => getInventoryRequestDisplayDate(request), [request])

    const assigneeAvatars = useMemo(() => request.assignedToUsers?.map(assignee => (
        <UserAvatar
            key={assignee.id}
            user={assignee}
        />
    )) ?? [], [request.assignedToUsers])

    return (
        <div>
            {request.assignedLocation && (
                <>
                    <Chip
                        startContent={<LocationIcon width={14} />}
                        color="primary"
                        variant="flat"
                        size="sm"
                        classNames={{
                            content: "font-semibold"
                        }}
                    >
                        {request.assignedLocation.name.toUpperCase().replaceAll("-", " ")}
                    </Chip>
                    <Spacer y={1} />
                </>
            )}
            <SubTitle className="!text-medium tablet:!text-sm !break-all" thick>
                {
                    `Request for ${new Date(displayDate).toLocaleDateString("en-JM")} @ ${new Date(displayDate).toLocaleTimeString("en-JM", {
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
                            src: getUserAvatarString(request.requestedByUser)
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
            <Divider className="my-6" />
            {children}
        </div>
    )
}

export default InventoryRequestCard;