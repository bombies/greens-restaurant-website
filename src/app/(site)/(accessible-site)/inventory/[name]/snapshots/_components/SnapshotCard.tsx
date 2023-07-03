"use client";

import { InventorySnapshot } from "@prisma/client";
import Link from "next/link";

type Props = {
    inventoryName: string,
    snapshot: InventorySnapshot
}

export default function SnapshotCard({ inventoryName, snapshot }: Props) {
    return (
        <Link
            href={`/inventory/${inventoryName}/snapshots/${snapshot.id}`}
        >
            <div className="default-container p-6 w-full transition-fast hover:-translate-y-1.5 hover:border-primary">
                <p>{new Date(snapshot.createdAt).toDateString()}</p>
            </div>
        </Link>
    );
}