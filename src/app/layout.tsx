import { Inter } from "next/font/google";
import React from "react";
import Providers from "./_components/Providers";
import "./globals.scss";
import clsx from "clsx";
import { getServerSession } from "next-auth";
import { authHandler } from "./api/auth/[...nextauth]/utils";

export const metadata = {
    title: "Green's Restaurant & Pub",
    description: "The Management Platform"
};

const inter = Inter({
    subsets: ["latin"]
});


type Props = React.PropsWithChildren

export default async function HomeLayout(props: Props) {
    const session = await getServerSession(authHandler);

    return (
        <html
            className={clsx(
                inter.className
            )}
            style={{
                backgroundImage: "url(\"/images/mesh-bg-2.png\")",
                backgroundRepeat: "no-repeat",
                backgroundAttachment: "fixed"
            }}
        >
        <Providers session={session}>
            {props.children}
        </Providers>
        </html>
    );
}