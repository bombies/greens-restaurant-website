import Title from "../../../../_components/text/Title";
import SubTitle from "../../../../_components/text/SubTitle";
import Clock from "../../../../_components/Clock";
import { Spacer } from "@nextui-org/react";
import LocationInventoryControlBar from "./components/BarInventoryControlBar";
import { PropsWithChildren } from "react";

type Context = {
    params: {
        location: string,
    }
} & PropsWithChildren

export default function Layout({ children, params }: Context) {
    return (
        <>
            <Title>{params.location.replaceAll("-", " ")}</Title>
            <SubTitle>It is currently <Clock />, {new Date().toLocaleDateString("en-JM")}</SubTitle>
            <Spacer y={6} />
            <LocationInventoryControlBar />
            <Spacer y={6} />
            {children}
        </>
    );
}