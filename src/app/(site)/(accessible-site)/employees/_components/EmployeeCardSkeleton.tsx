"use client";

import { Skeleton } from "@nextui-org/react";

export default function EmployeeCardSkeleton() {
    return (
        <div className='default-container p-6 transition-fast hover:-translate-y-1 hover:border-primary flex gap-4'>
            <Skeleton className='rounded-full w-10 h-10' />
            <Skeleton className='rounded-xl w-28 h-4 self-center' />
        </div>
    )
}