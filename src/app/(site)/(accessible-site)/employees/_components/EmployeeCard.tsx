"use client";

import { User } from "@prisma/client";
import Link from "next/link";
import { Avatar } from "@nextui-org/avatar";
import { useState } from "react";
import { useS3Base64AvatarString } from "../../../../_components/hooks/useS3Base64String";
import clsx from "clsx";
import { Skeleton } from "@nextui-org/react";

type Props = {
    user: User
}

export default function EmployeeCard({ user }: Props) {
    const { avatar, isLoading: avatarIsLoading } = useS3Base64AvatarString(user.id, user.avatar);
    const [avatarColor, setAvatarColor] = useState<"default" | "primary" | "secondary" | "success" | "warning" | "danger">("default");

    return (
        <Link href={`/employees/${user.username}`}>
            <div
                className="default-container p-6 transition-fast whitespace-nowrap overflow-hidden overflow-ellipsis hover:-translate-y-1 hover:border-primary flex gap-4"
                onMouseEnter={() => {
                    setAvatarColor("success");
                }}
                onMouseLeave={() => {
                    setAvatarColor("default");
                }}
            >
                <div className="w-fit">
                    <Skeleton isLoaded={!avatarIsLoading} className={clsx(
                        "rounded-full p-1",
                        !avatarIsLoading && "!bg-transparent"
                    )}>
                        <Avatar
                            isBordered
                            className="transition-fast"
                            src={avatar || (user.image || undefined)}
                            color={avatarColor}
                        />
                    </Skeleton>

                </div>
                <p className="flex flex-col justify-center overflow-hidden overflow-ellipsis capitalize font-semibold self-center">
                    {user.firstName} {user.lastName}
                </p>
            </div>
        </Link>

    );
}