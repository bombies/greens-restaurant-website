"use client";

import DoubleArrowIcon from "../../../_components/icons/DoubleArrowIcon";
import { JSX, MouseEventHandler, useState } from "react";
import clsx from "clsx";
import { CSSTransition } from "react-transition-group";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import InventoryIcon from "../../../_components/icons/InventoryIcon";
import waving from '/public/icons/waving-hand.svg';
import signOutIcon from '/public/icons/sign-out.svg';
import GenericImage from "../../../_components/GenericImage";
import GenericButton from "../../../_components/inputs/GenericButton";
import UsersIcon from "../../../_components/icons/UsersIcon";
import GearsIcon from "../../../_components/icons/GearsIcon";
import { sendToast } from "../../../../utils/Hooks";
import InvoiceIcon from "../../../_components/icons/InvoiceIcon";

export default function Sidebar() {
    const user = useSession();
    const [opened, setOpened] = useState(false);

    const sidebar = (
        <div
            className={`h-fit max-h-[90vh] w-96 py-12 px-6 border-2 border-white/5 bg-neutral-900/50 backdrop-blur-md rounded-3xl transition-fast shadow-inner`}>
            <div className="flex justify-center">
                <GenericImage src="https://i.imgur.com/HLTQ78m.png" width={10} />
            </div>
            <div>
                <div className="w-full max-h-[50vh] overflow-y-auto flex flex-col mb-6">
                    <InventorySidebarItem />
                    <EmployeesSidebarItem />
                    <InvoicesSidebarItem />
                    <ManagementSidebarItem />
                </div>
                <GenericButton
                    shadow
                    icon={signOutIcon}
                    onClick={() => signOut().then(() => {
                    sendToast({
                        description: 'See you later!',
                        icon: waving
                    }, {
                        position: 'top-center'
                    })
                })}>Sign Out</GenericButton>
            </div>
        </div>
    );

    return (
        <div className={clsx(`
            h-full
            p-6
            relative
            tablet:absolute
            transition-fast
            z-40`,
            opened ? "w-96" : "w-24"
        )}>
            <DoubleArrowIcon
                className={clsx(`
                    w-fit
                    hover:scale-110
                    transition-fastest
                    cursor-pointer
                    z-50
                    absolute
                    top-10
                    left-10`,
                    opened ? "rotate-180" : ""
                )}
                onClick={() => setOpened(prev => !prev)}
                width="2rem"
                fill={opened ? "#00D615" : "#ffffff"}
            />
            <CSSTransition
                in={opened}
                timeout={500}
                classNames="sidebar"
                unmountOnExit
            >
                {sidebar}
            </CSSTransition>
        </div>
    );
}

type SidebarItemProps = {
    label: string,
    href: string,
    icon: JSX.Element,
    onHoverEnter?: MouseEventHandler<HTMLDivElement>
    onHoverLeave?: MouseEventHandler<HTMLDivElement>
}

function SidebarItem(props: SidebarItemProps) {
    return (
        <Link href={props.href} className="text-white">
            <div className="flex gap-4 p-4 transition-fast hover:text-primary hover:bg-primary/5 rounded-md"
                 onMouseEnter={props.onHoverEnter}
                 onMouseLeave={props.onHoverLeave}
            >
                <div className="self-center">
                    {props.icon}
                </div>
                <p className="text-lg tracking-wide">{props.label}</p>
            </div>
        </Link>

    );
}

function InventorySidebarItem() {
    const [iconColor, setIconColor] = useState("#ffffff");
    const setActiveColor = () => setIconColor("#00D615");
    const setDefaultColor = () => setIconColor("#ffffff");

    const icon = <InventoryIcon width="1.25rem" height="1.25rem" className="transition-fast" fill={iconColor} />;
    return (<SidebarItem
        label={"Inventory"}
        href={"inventory"}
        icon={icon}
        onHoverEnter={setActiveColor}
        onHoverLeave={setDefaultColor}
    />);
}

function EmployeesSidebarItem() {
    const [iconColor, setIconColor] = useState("#ffffff");
    const setActiveColor = () => setIconColor("#00D615");
    const setDefaultColor = () => setIconColor("#ffffff");

    const icon = <UsersIcon width="1.25rem" height="1.25rem" className="transition-fast" fill={iconColor} />;
    return (<SidebarItem
        label={"Employees"}
        href={"employees"}
        icon={icon}
        onHoverEnter={setActiveColor}
        onHoverLeave={setDefaultColor}
    />);
}

function ManagementSidebarItem() {
    const [iconColor, setIconColor] = useState("#ffffff");
    const setActiveColor = () => setIconColor("#00D615");
    const setDefaultColor = () => setIconColor("#ffffff");

    const icon = <GearsIcon width="1.25rem" height="1.25rem" className="transition-fast" fill={iconColor} />;
    return (<SidebarItem
        label={"Management"}
        href={"management"}
        icon={icon}
        onHoverEnter={setActiveColor}
        onHoverLeave={setDefaultColor}
    />);
}

function InvoicesSidebarItem() {
    const [iconColor, setIconColor] = useState("#ffffff");
    const setActiveColor = () => setIconColor("#00D615");
    const setDefaultColor = () => setIconColor("#ffffff");

    const icon = <InvoiceIcon width="1.25rem" height="1.25rem" className="transition-fast" fill={iconColor} />;
    return (<SidebarItem
        label={"Invoices"}
        href={"invoices"}
        icon={icon}
        onHoverEnter={setActiveColor}
        onHoverLeave={setDefaultColor}
    />);
}

