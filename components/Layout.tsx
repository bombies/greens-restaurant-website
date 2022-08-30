import Head from "next/head";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { generateDefaultSidebar } from "../utils/GeneralUtils";
import { AnyAction, Dispatch } from "redux";

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
            <main>
                {props.authenticated ? (
                    generateLayout(
                        props.children,
                        sidebarOpened,
                        reduxDispatch,
                        props.pageTitle,
                        props.showSidebar
                    )
                ) : handleAuth ? (
                    <div></div>
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
        <div className="flex dark:bg-neutral-800 transition-fast">
            {(showSidebar === true || showSidebar === undefined) && generateDefaultSidebar(sidebarOpened, reduxDispatch)}
            <div className={`${(showSidebar === true || showSidebar === undefined) ? "pl-8 pt-16 " : ""}w-full`}>
                <div>
                    {pageTitle && (
                        <h1 className="text-7xl font-bold self-center pointer-events-none mb-12 dark:text-white">
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
