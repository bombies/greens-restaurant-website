"use client";

import { Fragment, useEffect } from "react";
import { Spacer } from "@nextui-org/react";
import { hasPermission, Permission } from "../../../../libs/types/permission";
import { useUserData } from "../../../../utils/Hooks";
import { useRouter } from "next/navigation";
import InventoryManagementSection from "./components/low-stock/LowStockManagementSection";
import Title from "@/app/_components/text/Title";
import SubTitle from "@/app/_components/text/SubTitle";
import ConfigProvider from "./components/ConfigProvider";

export default function ManagementPage() {
    const { data: userData, isLoading: userDataIsLoading } = useUserData();
    const router = useRouter();

    useEffect(() => {
        if (!userDataIsLoading &&
            (!userData || !hasPermission(userData.permissions, Permission.ADMINISTRATOR))
        )
            router.replace("/home");
    }, [router, userData, userDataIsLoading]);

    return (
        <Fragment>
            <Title>Management</Title>
            <SubTitle>Manage This Dashboard</SubTitle>
            <Spacer y={6} />
            <ConfigProvider>
                <section className="space-y-6">
                    <InventoryManagementSection />
                </section>
            </ConfigProvider>
        </Fragment>
    );
}