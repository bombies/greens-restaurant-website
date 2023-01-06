import Head from "next/head";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { generateDefaultSidebar } from "../utils/GeneralUtils";
import { AnyAction, Dispatch } from "redux";
import { montserrat } from "../utils/Fonts";

interface Props extends React.PropsWithChildren {
    title?: string;
    pageTitle?: string | JSX.Element;
    authenticated?: boolean;
    showSidebar?: boolean;
}

const Layout = (props: Props) => {
    // @ts-ignore
    const sidebarOpened = useSelector((state) => state.sidebar.value);
    const reduxDispatch = useDispatch();

    const handleAuth = props.authenticated !== undefined;

    return (
        <>
            <Head>
                <title>{`Green's Restaurant${
                    props.title ? ` - ${props.title}` : ""
                }`}</title>
            </Head>
            <main className={`${montserrat.variable} font-sans`}>
                {props.authenticated ? (
                    generateLayout(
                        props.children,
                        sidebarOpened,
                        reduxDispatch,
                        props.pageTitle,
                        props.showSidebar
                    )
                ) : handleAuth ? (
                    <div className=""></div>
                ) : (
                    generateLayout(
                        props.children,
                        sidebarOpened,
                        reduxDispatch,
                        props.pageTitle,
                        props.showSidebar
                    )
                )}
            </main>
        </>
    );
};

const generateLayout = (
    children: React.ReactNode,
    sidebarOpened: boolean,
    reduxDispatch: Dispatch<AnyAction>,
    pageTitle?: string | JSX.Element,
    showSidebar?: boolean
) => {
    return (
        <div className="flex tablet:block dark:bg-neutral-800 bg-neutral-50 transition-fast min-h-screen h-fit">
            {(showSidebar === true || showSidebar === undefined) && generateDefaultSidebar(sidebarOpened, reduxDispatch)}
            <div className={`${(showSidebar === true || showSidebar === undefined) ? "px-8 pt-16 phone:pl-3 phone:pr-0 phone:pt-12 " : ""} min-h-screen w-full`}>
                <div className="h-full">
                    {pageTitle && (
                        <h1 className="text-7xl phone:text-5xl font-bold self-center pointer-events-none mb-12 dark:text-white">
                            {pageTitle}
                        </h1>
                    )}
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Layout;
