import Image from "next/image";
import Link from "next/link";
import React, { MouseEventHandler, useContext, useState } from "react";
import Toggle from "../Toggle";
import { useDispatch, useSelector } from "react-redux";
import { toggleDarkMode } from "../../utils/redux/DarkModeSlice";
import { useMutation } from "react-query";
import axios from "axios";
import { GenerateNotificationAddAction } from "../notifications/NotificationTypes";
import { v4 } from "uuid";
import { NotificationType } from "../../types/NotificationType";
import { NotificationContext } from "../notifications/NotificationProvider";
import { setUserData } from "../../utils/redux/UserDataSlice";
import SidebarItem from "./SidebarItem";

interface Props extends React.PropsWithChildren {
    icon?: string;
    label?: string;
    labelColor?: string;
    color: string;
    sidebarOpened: boolean;
    toggleSidebar: MouseEventHandler<HTMLDivElement>;
}

const Sidebar = (props: Props) => {
    // @ts-ignore
    const darkMode = useSelector((state) => state.darkMode.value);
    // @ts-ignore
    const userData = useSelector((state) => state.userData.value);
    const reduxDispatcher = useDispatch();
    const notificationDispatch = useContext(NotificationContext);

    const logout = useMutation(() => {
        return axios
            .post("/api/logout")
            .then(() => {
                // @ts-ignore
                reduxDispatcher(setUserData({}));
                if (notificationDispatch) {
                    notificationDispatch(
                        GenerateNotificationAddAction(
                            v4(),
                            NotificationType.SUCCESS,
                            "Successfully logged out!"
                        )
                    );
                }
            })
            .catch((err) => {
                if (notificationDispatch) {
                    notificationDispatch(
                        GenerateNotificationAddAction(
                            v4(),
                            NotificationType.ERROR,
                            err.response.data.message ||
                                JSON.stringify(err.response.data.error)
                        )
                    );
                }
            });
    });

    return (
        <div
            className={`relative top-0 transition-fast p-2 ${
                props.sidebarOpened ? "w-64" : "w-32"
            } ${props.color} shadow-[0_0_10px_5px_rgba(0,0,0,0.1)]`}
        >
            <div className="sticky top-0">
                <div className='flex justify-end'>
                    <div
                        className={`transition-fast relative z-10 w-6 h-6 hover:cursor-pointer transition-faster ${
                            props.sidebarOpened ? "" : "rotate-180"
                        }`}
                        onClick={props.toggleSidebar}
                    >
                        <Image
                            src="https://i.imgur.com/znUzMg4.png"
                            alt=""
                            layout="fill"
                        />
                    </div>
                </div>
                <div className="transition-fast mt-6 mb-6">
                    {props.icon && (
                        <Link href="/">
                            <div
                                className={`transition-fast relative ${
                                    props.sidebarOpened
                                        ? "w-32 h-32"
                                        : "w-20 h-20"
                                } self-center mx-auto hover:cursor-pointer`}
                            >
                                <Image src={props.icon} alt="" layout="fill" />
                            </div>
                        </Link>
                    )}
                    {props.label && props.sidebarOpened && (
                        <p
                            className={`transition-fast font-bold mx-1 text-xl text-center uppercase pointer-events-none ${
                                props.labelColor
                                    ? props.labelColor
                                    : "text-white"
                            }`}
                        >
                            {props.label}
                        </p>
                    )}
                </div>
                <div className="flex flex-col">
                    {props.children}
                    <SidebarItem
                        icon="https://i.imgur.com/Z0Iiqv2.png"
                        label="Logout"
                        onClick={() => logout.mutate()}
                        sidebarOpened={props.sidebarOpened}
                    />
                    <div className="flex justify-center mt-6">
                        <Toggle
                            state={darkMode}
                            onClick={() => reduxDispatcher(toggleDarkMode())}
                            onIcon="https://i.imgur.com/vlb61Uh.png"
                            offIcon="https://i.imgur.com/WlaCFSH.png"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;