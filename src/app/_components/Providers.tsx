'use client';

import React from "react";
import { useServerInsertedHTML } from "next/navigation";
import { CssBaseline, NextUIProvider } from "@nextui-org/react";
import { SWRConfig } from "swr";
import { SSRProvider } from "@react-aria/ssr";
import ReduxProvider from "./ReduxProvider";
import { ThemeProvider } from "next-themes";
import lightTheme from "../../utils/ui/themes/default-light";
import darkTheme from "../../utils/ui/themes/default-dark";
import { DarkModeProvider } from "./DarkModeProvider";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";

interface Props extends React.PropsWithChildren {
    session: any;
}

export default function Providers(props: Props) {
    useServerInsertedHTML(() => <>{CssBaseline.flush()}</>);

    return (
        <body>
        <SWRConfig
            value={{
                refreshInterval: 60 * 1000,
                revalidateOnFocus: false
            }}
        >
            <SSRProvider>
                <ReduxProvider>
                    <ThemeProvider
                        defaultTheme="light"
                        attribute="class"
                        value={{
                            light: lightTheme.className,
                            dark: darkTheme.className
                        }}
                    >
                        <NextUIProvider>
                            <DarkModeProvider>
                                <SessionProvider session={props.session}>
                                    <Toaster
                                        position="top-right"
                                        reverseOrder={false}
                                    />
                                    {props.children}
                                </SessionProvider>
                            </DarkModeProvider>
                        </NextUIProvider>
                    </ThemeProvider>
                </ReduxProvider>
            </SSRProvider>
        </SWRConfig>
        </body>
    );
}