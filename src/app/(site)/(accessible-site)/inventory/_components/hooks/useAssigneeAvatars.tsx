"use client";

import { StockRequestWithOptionalCreatorAndAssignees } from "../requests/inventory-requests-utils";
import { useEffect, useMemo } from "react";
import { useS3AvatarUrls } from "../../../../../_components/hooks/useS3Base64String";
import { Tooltip } from "@nextui-org/react";
import { Avatar } from "@nextui-org/avatar";

const useAssigneeAvatars = (request?: StockRequestWithOptionalCreatorAndAssignees) => {
    const avatarsToLookup = useMemo(() => request?.assignedToUsers ?? [], [request?.assignedToUsers]);
    useEffect(() => {
        if (request?.requestedByUser && !avatarsToLookup.find(user => user.id === request?.requestedByUser?.id))
            avatarsToLookup.push(request?.requestedByUser);
    }, [avatarsToLookup, request?.requestedByUser]);

    const { avatars } = useS3AvatarUrls(avatarsToLookup);
    const assigneeAvatars = useMemo(() => {
        return request?.assignedToUsers
            ?.filter(user => request?.assignedToUsersId.includes(user.id))
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
    }, [avatars, request?.assignedToUsers, request?.assignedToUsersId]);

    return { assigneeAvatars, avatars };
};

export default useAssigneeAvatars;