"use client";

import { Skeleton, Spacer } from "@nextui-org/react";

type Props = {
    width?: string,
    contentRepeat?: number,
}

export default function CardSkeleton({ width, contentRepeat }: Props) {
    const content = Array(contentRepeat || 1).fill(
        <Skeleton className="rounded-2xl w-1/2 h-3" />
    );

    return (
        <div
            className="default-container p-6"
            style={{
                width: width || "100%"
            }}
        >
            {content}
        </div>
    );
}