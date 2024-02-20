"use client";

import React from "react";
import { SWRConfig } from "swr";
import ReduxProvider from "../ReduxProvider";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";
import { NextUIProvider } from "@nextui-org/react";
import { ThemeProvider } from "next-themes";
import { AppProgressBar } from "next-nprogress-bar";
import { Session } from "next-auth";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import MaterialUIThemeProvider from "./MaterialUIThemeProvider";

interface Props extends React.PropsWithChildren {
    session: Session | null;
}

export default function Providers(props: Props) {

    return (
        <SWRConfig
            value={{
                refreshInterval: 60 * 1000,
                revalidateOnFocus: false
            }}
        >
            <ReduxProvider>
                <NextUIProvider>
                    <ThemeProvider attribute="class" defaultTheme="dark">
                        <MaterialUIThemeProvider>
                            <SessionProvider session={props.session}>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <AppProgressBar
                                        height="4px"
                                        color="#00D615"
                                        options={{ showSpinner: true }}
                                        shallowRouting
                                    />
                                    <Toaster
                                        position="top-center"
                                        reverseOrder
                                        toastOptions={{
                                            className: `
                                        default-container
                                        backdrop-blur-sm p-6
                                        min-w-96 max-w-[32rem]
                                        flex
                                        gap-4
                                        justify-between`,
                                            style: {
                                                background: "#100f1090",
                                                color: "#ffffff",
                                                border: "2px solid #00000005",
                                                borderRadius: "1.5rem",
                                                padding: "1.5rem"
                                            }
                                        }}
                                    />
                                    {props.children}
                                </LocalizationProvider>
                            </SessionProvider>
                        </MaterialUIThemeProvider>
                    </ThemeProvider>
                </NextUIProvider>
            </ReduxProvider>
        </SWRConfig>
    );
}