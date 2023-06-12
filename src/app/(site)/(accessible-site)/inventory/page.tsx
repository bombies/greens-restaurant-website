"use client";

import Title from "../../../_components/text/Title";
import SubTitle from "../../../_components/text/SubTitle";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { hasAnyPermission, Permission } from "../../../../libs/types/permission";
import { useRouter } from "next/navigation";
import { Spacer } from "@nextui-org/react";
import InventoryControlBar from "./_components/InventoryControlBar";
import InventoryGrid from "./_components/InventoryGrid";

export default function InventoryPage() {
    const session = useSession();
    const router = useRouter();

    useEffect(() => {

        if (session.status !== "loading" && !hasAnyPermission(session.data?.user?.permissions, [
            Permission.CREATE_INVENTORY,
            Permission.VIEW_INVENTORY,
            Permission.MUTATE_STOCK
        ]))
            router.replace("/home");
    }, [router, session]);

    return (
        <div>
            <Title>Inventory</Title>
            <SubTitle>Create, delete and edit inventories</SubTitle>
            <Spacer y={6} />
            <InventoryControlBar />
            <Spacer y={6} />
            <InventoryGrid />
        </div>
    );
}