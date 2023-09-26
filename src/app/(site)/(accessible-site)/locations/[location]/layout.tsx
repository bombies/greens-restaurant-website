import Title from "../../../../_components/text/Title";
import SubTitle from "../../../../_components/text/SubTitle";
import Clock from "../../../../_components/Clock";
import { Spacer } from "@nextui-org/spacer";
import LocationInventoryControlBar from "./components/LocationInventoryControlBar";
import { PropsWithChildren } from "react";

type Context = {
    params: {
        location: string,
    }
} & PropsWithChildren

export default function Layout({ children, params }: Context) {
    return (
        <>
            <Title className="capitalize">{params.location.replaceAll("-", " ")}</Title>
            <SubTitle>It is currently <Clock />, {new Date().toLocaleDateString("en-JM")}</SubTitle>
            <Spacer y={6} />
            <LocationInventoryControlBar locationName={params.location} />
            <Spacer y={6} />
            {children}
        </>
    );
}