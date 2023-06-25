import Image from "next/image";
import Link from "next/link";
import React, { MouseEventHandler, useContext, useEffect, useState } from "react";
import Toggle from "../Toggle";
import { useDispatch, useSelector } from "react-redux";
import { toggleDarkMode } from "../../utils/redux/slices/DarkModeSlice";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { GenerateNotificationAddAction } from "../notifications/NotificationTypes";
import { v4 } from "uuid";
import { NotificationType } from "../../types/NotificationType";
import { NotificationContext } from "../notifications/NotificationProvider";
import { setUserData } from "../../utils/redux/slices/UserDataSlice";
import SidebarItem from "./SidebarItem";
import { UserData } from "../../types/UserData";

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
    const userData: UserData = useSelector((state) => state.userData.value);
    const reduxDispatcher = useDispatch();
    const notificationDispatch = useContext(NotificationContext);

    const [ miniBarOpened, setMinibarOpened ] = useState(false);
    const toggleMiniBar = () => {
        setMinibarOpened(val => !val);
    }

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1025)
                setMinibarOpened(false);
            else if (props.sidebarOpened)
                setMinibarOpened(true);
        }

        window.addEventListener('resize', handleResize)

        return () => { window.removeEventListener('resize', handleResize) }
    });

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

    const generateSidebarItems = () => {
        return (
            <div className='flex flex-col'>
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
                        onClick={(e) =>  {
                            e.stopPropagation();
                            reduxDispatcher(toggleDarkMode());
                        }}
                        onIcon="https://i.imgur.com/vlb61Uh.png"
                        offIcon="https://i.imgur.com/WlaCFSH.png"
                    />
                </div>
            </div>
        )
    };

    return (
        <div className={`tablet:pt-6 tablet:z-50 ${miniBarOpened ? 'absolute z-50' : ''}`}>
            <div
                className={`tablet-min:hidden tablet:visible 
            ${props.color} ${props.sidebarOpened ? 'w-72 h-[36rem]' : 'w-12 h-12' }  rounded-xl 
            shadow-[0_0_10px_5px_rgba(0,0,0,0.1)] ml-6 p-2
            hover:cursor-pointer hover:scale-105 transition-fast
            `}
                onClick={(e) => {
                    props.toggleSidebar(e);
                    toggleMiniBar();
                }}
            >
                {
                    props.sidebarOpened ?
                        <div>
                            <div
                                className='relative w-6 h-6 m-3 hover:scale-105 transition-fast'
                                onClick={(e) => {
                                    props.toggleSidebar(e);
                                    toggleMiniBar();
                                }}
                            >
                                <Image
                                    src={'https://i.imgur.com/qNlanxv.png'}
                                    alt={'Close minibar'}
                                    fill={true}
                                />
                            </div>
                            {props.icon && (
                                <Link href="/">
                                    <div
                                        className={`transition-fast relative ${
                                            props.sidebarOpened
                                                ? "w-32 h-32"
                                                : "w-20 h-20"
                                        } self-center mx-auto hover:cursor-pointer`}
                                    >
                                        <Image src={props.icon} alt="" fill={true} />
                                    </div>
                                </Link>
                            )}
                            {generateSidebarItems()}
                        </div>
                        :
                        <div className='flex flex-col h-full gap-y-1 justify-center'>
                            <div className='self-center w-1/2 h-[0.15rem] bg-white rounded-full'></div>
                            <div className='self-center w-1/2 h-[0.15rem] bg-white rounded-full'></div>
                            <div className='self-center w-1/2 h-[0.15rem] bg-white rounded-full'></div>
                        </div>
                }
            </div>
            <div
                className={`tablet:hidden relative top-0 transition-fast p-2 ${
                    props.sidebarOpened ? "w-64 tablet:w-48" : "w-32 tablet:w-24"
                } ${props.color} shadow-[0_0_10px_5px_rgba(0,0,0,0.1)] h-full`}
            >
                <div className="sticky top-12">
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
                                fill={true}
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
                                    <Image src={props.icon} alt="" fill={true} />
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
                    {generateSidebarItems()}
                </div>
            </div>
        </div>

    );
};

export default Sidebar;