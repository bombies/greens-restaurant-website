"use client";

import { FC, useMemo } from "react";
import { Avatar, AvatarProps, Tooltip } from "@nextui-org/react";
import { User } from "@prisma/client";
import { getUserAvatarString } from "app/(site)/(accessible-site)/employees/employee-utils";

type Props = {
    showToolTip?: boolean,
    showName?: boolean,
    user: User
} & Omit<AvatarProps, "src">

const UserAvatar: FC<Props> = ({ user, showToolTip, showName, ...props }) => {
    const avatar = useMemo(() => (
        <Avatar
            src={getUserAvatarString(user)}
            showFallback
            {...props}
        />
    ), [props, user]);

    return showToolTip ? (
        <Tooltip
            content={`${user.firstName} ${user.lastName}`}
            closeDelay={100}
        >
            {avatar}
        </Tooltip>
    ) : avatar;
};

export default UserAvatar;