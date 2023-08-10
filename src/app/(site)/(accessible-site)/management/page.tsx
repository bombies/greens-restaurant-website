"use client";

import { Fragment, useEffect } from "react";
import Title from "../../../_components/text/Title";
import SubTitle from "../../../_components/text/SubTitle";
import { Spacer } from "@nextui-org/react";
import GenericCard from "../../../_components/GenericCard";
import { hasPermission, Permission } from "../../../../libs/types/permission";
import { useUserData } from "../../../../utils/Hooks";
import { useRouter } from "next/navigation";

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
            <div className="w-fit">
                <GenericCard className="text-xl p-12 uppercase font-semibold">🚧 This page is under construction
                    🚧</GenericCard>
            </div>
        </Fragment>
    );
}