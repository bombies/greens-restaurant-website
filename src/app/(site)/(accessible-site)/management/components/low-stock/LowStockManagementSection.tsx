"use client"

import Container from "@/app/_components/Container";
import SubTitle from "@/app/_components/text/SubTitle";
import { FC } from "react";
import LowStockManagementContainer from "./LowStockManagementContainer";
import { useConfig } from "../ConfigProvider";
import ContainerSkeleton from "@/app/_components/skeletons/ContainerSkeleton";

const InventoryManagementSection: FC = () => {
    const { loading } = useConfig()

    return loading ? (
        <>
            <ContainerSkeleton />
        </>
    ) : (
        <Container>
            <SubTitle>Low Stock Thresholds</SubTitle>
            <LowStockManagementContainer />
        </Container>
    )


}

export default InventoryManagementSection