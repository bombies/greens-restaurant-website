import React from "react";
import Title from "../../../_components/text/Title";
import SubTitle from "../../../_components/text/SubTitle";
import Clock from "../../../_components/Clock";
import { Spacer } from "@nextui-org/spacer";
import CurrentStockProvider from "../inventory/[name]/_components/CurrentStockContext";
import BarInventoryControlBar from "./components/BarInventoryControlBar";

type Context = React.PropsWithChildren

export default function Layout({ children }: Context) {
    return (
        <>
            <Title>The Bar</Title>
            <SubTitle>It is currently <Clock />, {new Date().toLocaleDateString("en-JM")}</SubTitle>
            <Spacer y={6} />
            <CurrentStockProvider>
                <BarInventoryControlBar />
                <Spacer y={6} />
                {children}
            </CurrentStockProvider>
        </>
    );
}