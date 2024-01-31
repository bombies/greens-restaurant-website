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
import { AnimatePresence, motion } from "framer-motion";
import useScreenSize from "../../../_components/hooks/useScreenSize";

export default function Sidebar() {
    const { data: user } = useUserData();
    const [opened, setOpened] = useState(false);
    const screenSize = useScreenSize();

    return (
        <>
            <div className={`tablet:absolute top-5 left-5 phone:left-1 z-[51] tablet-min:hidden`}>
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
            <AnimatePresence>
                {(opened || (screenSize !== undefined && screenSize.width > 1025)) && (
                    <motion.div
                        initial={{
                            opacity: 0,
                            x: -100
                        }}
                        animate={{
                            opacity: 1,
                            x: 0
                        }}
                        exit={{
                            opacity: 0,
                            x: -100
                        }}
                        className={clsx(
                            `tablet:fixed h-full tablet:h-screen w-28 tablet:w-64 default-container !rounded-l-none backdrop-blur-md z-50`
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
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}


