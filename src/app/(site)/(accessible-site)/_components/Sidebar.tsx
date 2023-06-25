"use client";

import DoubleArrowIcon from "../../../_components/icons/DoubleArrowIcon";
import { JSX, MouseEventHandler, useState } from "react";
import clsx from "clsx";
import { CSSTransition } from "react-transition-group";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import InventoryIcon from "../../../_components/icons/InventoryIcon";
import waving from "/public/icons/waving-hand.svg";
import signOutIcon from "/public/icons/sign-out.svg";
import GenericImage from "../../../_components/GenericImage";
import GenericButton from "../../../_components/inputs/GenericButton";
import UsersIcon from "../../../_components/icons/UsersIcon";
import GearsIcon from "../../../_components/icons/GearsIcon";
import { sendToast } from "../../../../utils/Hooks";
import InvoiceIcon from "../../../_components/icons/InvoiceIcon";
import AccountIcon from "../../../_components/icons/AccountIcon";
import { hasAnyPermission, hasPermission, Permission } from "../../../../libs/types/permission";

export default function Sidebar() {
    const session = useSession();
    const [opened, setOpened] = useState(false);

    const sidebar = (
        <div
            className={`h-fit default-container w-96 phone:w-80 py-12 px-6 backdrop-blur-md transition-fast`}>
            <div className="flex justify-center">
                <Link href="/home">
                    <GenericImage src="https://i.imgur.com/HLTQ78m.png" width={10} />
                </Link>
            </div>
            <div>
                <div className="w-full max-h-[50vh] overflow-y-auto flex flex-col mb-6">
                    {
                        hasAnyPermission(session.data?.user?.permissions, [
                            Permission.CREATE_INVENTORY,
                            Permission.VIEW_INVENTORY,
                            Permission.MUTATE_STOCK
                        ])
                        &&
                        <InventorySidebarItem />
                    }
                    {
                        hasPermission(session.data?.user?.permissions, Permission.ADMINISTRATOR)
                        &&
                        <EmployeesSidebarItem />
                    }
                    {
                        hasAnyPermission(session.data?.user?.permissions, [
                            Permission.VIEW_INVOICES,
                            Permission.CREATE_INVOICE,
                        ])
                        &&
                        <InvoicesSidebarItem />
                    }
                    <AccountSidebarItem />
                    {
                        hasPermission(session.data?.user?.permissions, Permission.ADMINISTRATOR)
                        &&
                        <ManagementSidebarItem />
                    }
                </div>
                <GenericButton
                    shadow
                    icon={signOutIcon}
                    onClick={() => signOut().then(() => {
                        sendToast({
                            description: "See you later!",
                            icon: waving
                        }, {
                            position: "top-center"
                        });
                    })}>Sign Out</GenericButton>
            </div>
        </div>
    );

    return (
        <div className={clsx(`
            h-full
            p-6
            sticky
            tablet:absolute
            top-0
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

function AccountSidebarItem() {
    const [iconColor, setIconColor] = useState("#ffffff");
    const setActiveColor = () => setIconColor("#00D615");
    const setDefaultColor = () => setIconColor("#ffffff");

    const icon = <AccountIcon width="1.25rem" height="1.25rem" className="transition-fast" fill={iconColor} />;
    return (<SidebarItem
        label={"My Account"}
        href={"account"}
        icon={icon}
        onHoverEnter={setActiveColor}
        onHoverLeave={setDefaultColor}
    />);
}


