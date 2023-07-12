"use client";

import Link from "next/link";
import React from "react";

type Props = {
    href: string,
} & React.PropsWithChildren

export default function LinkCard({ href, children }: Props) {
    return (
        <Link href={href}>
            <div className="default-container p-6 transition-fast hover:-translate-y-1 hover:border-primary flex gap-4">
                {children}
            </div>
        </Link>
    );
}