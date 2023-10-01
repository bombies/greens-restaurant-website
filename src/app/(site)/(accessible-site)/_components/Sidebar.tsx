"use client";

import DoubleArrowIcon from "../../../_components/icons/DoubleArrowIcon";
import { Fragment, useState } from "react";
import clsx from "clsx";
import { signOut } from "next-auth/react";
import Link from "next/link";
import signOutIcon from "/public/icons/sign-out.svg";
import GenericImage from "../../../_components/GenericImage";
import GenericButton from "../../../_components/inputs/GenericButton";
import { hasAnyPermission, hasPermission, Permission } from "../../../../libs/types/permission";
import { toast } from "react-hot-toast";
import { useUserData } from "../../../../utils/Hooks";
import LocationsSidebarItem from "./items/LocationsSidebarItem";
import InventorySidebarItem from "./items/InventorySidebarItem";
import InventoryRequestsSidebarItem from "./items/InventoryRequestsSidebarItem";
import EmployeesSidebarItem from "./items/EmployeesSidebarItem";
import InvoicesSidebarItem from "./items/InvoicesSidebarItem";
import AccountSidebarItem from "./items/AccountSidebarItem";
import ManagementSidebarItem from "./items/ManagementSidebarItem";
import IconButton from "../../../_components/inputs/IconButton";
import SignOutIcon from "../../../_components/icons/SignOutIcon";

export default function Sidebar() {
    const { data: user } = useUserData();
    const [opened, setOpened] = useState(false);

    const sidebar = (
        <Fragment>
            <div className={`absolute
                    top-5 left-5 z-50`}>
                <IconButton
                    variant="light"
                    onPress={() => setOpened(prev => !prev)}
                >
                    <DoubleArrowIcon
                        className={clsx(`
                            transition-fastest
                            cursor-pointer
                            z-50`,
                            opened ? "rotate-180" : ""
                        )}
                        width="1.5rem"
                        fill={opened ? "#00D615" : "#ffffff"}
                    />
                </IconButton>
            </div>
            <div
                className={clsx(
                    `h-full w-full default-container !rounded-l-none backdrop-blur-md transition-fast`,
                    !opened ? "tablet:!opacity-0 tablet:hidden" : "tablet:!opacity-100"
                )}>
                <div className="flex justify-center mt-20">
                    <Link href="/home">
                        <GenericImage
                            src="https://i.imgur.com/HLTQ78m.png"
                            className={clsx(opened ? "w-48 phone:w-24 h-48 phone:h-24" : "w-24 h-24")}
                        />
                    </Link>
                </div>
                <nav className={clsx(
                    "max-h-[70%] overflow-y-auto overflow-x-hidden tablet:mx-auto flex flex-col mb-6",
                    !opened && "items-center"
                )}>
                    {
                        hasAnyPermission(user?.permissions, [
                            Permission.CREATE_INVENTORY,
                            Permission.VIEW_LOCATIONS,
                            Permission.MUTATE_LOCATIONS
                        ])
                        &&
                        <LocationsSidebarItem sidebarOpened={opened} />
                    }
                    {
                        hasAnyPermission(user?.permissions, [
                            Permission.CREATE_INVENTORY,
                            Permission.VIEW_INVENTORY,
                            Permission.MUTATE_STOCK
                        ])
                        &&
                        <InventorySidebarItem sidebarOpened={opened} />
                    }
                    {
                        hasAnyPermission(user?.permissions, [
                            Permission.CREATE_INVENTORY,
                            Permission.MANAGE_STOCK_REQUESTS,
                            Permission.CREATE_STOCK_REQUEST,
                            Permission.VIEW_STOCK_REQUESTS
                        ])
                        &&
                        <InventoryRequestsSidebarItem sidebarOpened={opened} />
                    }
                    {
                        hasPermission(user?.permissions, Permission.ADMINISTRATOR)
                        &&
                        <EmployeesSidebarItem sidebarOpened={opened} />
                    }
                    {
                        hasAnyPermission(user?.permissions, [
                            Permission.VIEW_INVOICES,
                            Permission.CREATE_INVOICE
                        ])
                        &&
                        <InvoicesSidebarItem sidebarOpened={opened} />
                    }
                    <AccountSidebarItem sidebarOpened={opened} />
                    {
                        hasPermission(user?.permissions, Permission.ADMINISTRATOR)
                        &&
                        <ManagementSidebarItem sidebarOpened={opened} />
                    }
                </nav>
                <div className="flex justify-center">
                    {
                        opened ?
                            <GenericButton
                                icon={signOutIcon}
                                onPress={() => signOut().then(() => {
                                    toast("See you later!", {
                                        icon: "👋"
                                    });
                                })}>Sign Out</GenericButton>
                            :

                            <IconButton
                                toolTip="Sign Out"
                                toolTipProps={{
                                    placement: "right"
                                }}
                                variant="shadow"
                                onPress={() => signOut().then(() => {
                                    toast("See you later!", {
                                        icon: "👋"
                                    });
                                })}
                            >
                                <SignOutIcon />
                            </IconButton>
                    }
                </div>
            </div>
        </Fragment>
    );

    return (
        <header className={clsx(`
            grow-0
            sticky
            top-0
            h-screen
            overflow-x-hidden
            tablet:fixed
            transition-fast
            `,
            opened ? "w-64 z-40" : "w-32"
        )}>
            {sidebar}
        </header>
    );
}


