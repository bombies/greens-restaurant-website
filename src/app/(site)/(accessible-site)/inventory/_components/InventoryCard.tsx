"use client";

import Link from "next/link";
import LinkCard from "../../../../_components/LinkCard";

type Props = {
    name: string
}

export default function InventoryCard({ name }: Props) {
    return (
        <LinkCard href={`/inventory/${name}`}>
            <p className="capitalize">{name.replaceAll("-", " ")}</p>
        </LinkCard>
    );
}