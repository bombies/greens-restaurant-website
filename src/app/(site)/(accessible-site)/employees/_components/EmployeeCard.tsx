"use client";

import { User } from "@prisma/client";
import Link from "next/link";
import { Avatar } from "@nextui-org/avatar";
import { useState } from "react";

type Props = {
    user: User
}

export default function EmployeeCard({ user }: Props) {
    const [avatarColor, setAvatarColor] = useState<"default" | "primary" | "secondary" | "success" | "warning" | "danger">("default");

    return (
        <Link href={`/employees/${user.username}`}>
            <div
                className="default-container p-6 transition-fast hover:-translate-y-1 hover:border-primary flex gap-4"
                onMouseEnter={() => {
                    setAvatarColor("success")
                }}
                onMouseLeave={() => {
                    setAvatarColor("default")
                }}
            >
                <div className="w-fit">
                    <Avatar
                        isBordered
                        className="transition-fast"
                        src={user.image || undefined}
                        color={avatarColor}
                    />
                </div>
                <p className="flex flex-col justify-center whitespace-nowrap overflow-hidden overflow-ellipsis capitalize font-semibold self-center">
                    {user.firstName} {user.lastName}
                </p>
            </div>
        </Link>

    );
}