"use client";

import Link from "next/link";

type Props = {
    name: string
}

export default function InventoryCard({ name }: Props) {
    return (
        <Link href={`/inventory/${name}`}>
            <div className="default-container p-6 transition-fast hover:-translate-y-1 hover:border-primary flex gap-4">
                <p className="capitalize">{name.replaceAll("-", " ")}</p>
            </div>
        </Link>
    );
}