"use client";

import React from "react";
import { SWRConfig } from "swr";
import ReduxProvider from "./ReduxProvider";
import { DarkModeProvider } from "./DarkModeProvider";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";
import { NextUIProvider } from "@nextui-org/react";

interface Props extends React.PropsWithChildren {
    session: any;
}

export default function Providers(props: Props) {

    return (
        <body>
        <SWRConfig
            value={{
                refreshInterval: 60 * 1000,
                revalidateOnFocus: false
            }}
        >
            <ReduxProvider>
                <DarkModeProvider>
                    <NextUIProvider>
                        <SessionProvider session={props.session}>
                            <Toaster
                                position="top-center"
                                reverseOrder={false}
                            />
                            {props.children}
                        </SessionProvider>
                    </NextUIProvider>
                </DarkModeProvider>
            </ReduxProvider>
        </SWRConfig>
        </body>
    );
}