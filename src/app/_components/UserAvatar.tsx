"use client";

import { FC, useMemo } from "react";
import { Avatar, AvatarProps, Tooltip } from "@nextui-org/react";
import { useS3UserAvatarUrl } from "./hooks/useS3Base64String";
import { User } from "@prisma/client";

type Props = {
    showToolTip?: boolean,
    showName?: boolean,
    user: User
} & Omit<AvatarProps, "src">

const UserAvatar: FC<Props> = ({ user, showToolTip, showName, ...props }) => {
    const { url: avatarUrl } = useS3UserAvatarUrl(user.id, user.avatar);

    const avatar = useMemo(() => (
        <Avatar
            src={avatarUrl || (user.image || undefined)}
            showFallback
            {...props}
        />
    ), [avatarUrl, props, user.image]);

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