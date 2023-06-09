'use client';

import { User } from "@prisma/client";
import Link from "next/link";
import { Avatar } from "@nextui-org/avatar";

type Props = {
    user: User
}

export default function EmployeeCard({ user }: Props) {
    return (
        <Link href={`/employees/${user.username}`}>
            <div className='default-container p-6 transition-fast hover:-translate-y-1 hover:border-primary flex gap-4'>
                <Avatar src={user.image || undefined} />
                <div className='flex flex-col justify-center'>
                    <p className='capitalize font-semibold self-center'>{user.firstName} {user.lastName}</p>
                </div>
            </div>
        </Link>

    )
}