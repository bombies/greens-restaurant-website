import Title from "../../../../_components/text/Title";
import SubTitle from "../../../../_components/text/SubTitle";
import Clock from "../../../../_components/Clock";
import { Spacer } from "@nextui-org/spacer";
import React from "react";
import SpecificInventoryControlBar from "./_components/SpecificInventoryControlBar";
import CurrentStockProvider from "./_components/CurrentStockContext";

type Context = {
    params: {
        name: string
    }
} & React.PropsWithChildren

export default function Layout({ children, params }: Context) {
    return (
        <>
            <Title>
                Inventory - <span
                className="text-primary capitalize">{params.name.replaceAll("-", " ") || "Unknown"}</span>
            </Title>
            <SubTitle>It is currently <Clock />, {new Date().toLocaleDateString("en-JM")}</SubTitle>
            <Spacer y={6} />
            <CurrentStockProvider>
                <SpecificInventoryControlBar inventoryName={params.name} />
                <Spacer y={6} />
                {children}
            </CurrentStockProvider>
        </>
    )
}