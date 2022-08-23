import Image from "next/image";
import Link from "next/link";
import React, { MouseEventHandler, useState } from "react";
import Toggle from "../Toggle";
import {useDispatch, useSelector} from "react-redux";
import {toggleDarkMode} from "../../utils/redux/DarkModeSlice";

interface Props extends React.PropsWithChildren {
    icon?: string,
    label?: string,
    labelColor?: string,
    color: string,
    sidebarOpened: boolean,
    toggleSidebar: MouseEventHandler<HTMLDivElement>
}

const Sidebar = (props: Props) => {
    // @ts-ignore
    const darkMode = useSelector(state => state.darkMode.value);
    const reduxDispatcher = useDispatch();

    return (
        <div className={`relative transition-fast p-2 h-screen ${props.sidebarOpened ? 'w-64' : 'w-32'} ${props.color} shadow-[0_0_10px_5px_rgba(0,0,0,0.1)]`}>
            <div className={`transition-fast absolute Z-10 w-6 h-6 right-2 hover:cursor-pointer transition-faster ${props.sidebarOpened ? '' : 'rotate-180'}`} onClick={props.toggleSidebar}>
                <Image src='https://i.imgur.com/znUzMg4.png' alt='' layout='fill' />
            </div>
            <div className='transition-fast mt-6 mb-6'>
                {
                    props.icon &&
                    <Link href='/'>
                        <div className={`transition-fast relative ${props.sidebarOpened ? 'w-32 h-32' : 'w-20 h-20'} self-center mx-auto hover:cursor-pointer`}>
                            <Image src={props.icon} alt='' layout='fill' />
                        </div>
                    </Link> 
                }
                {
                    props.label && props.sidebarOpened &&
                    <p className={`transition-fast font-bold mx-1 text-xl text-center uppercase pointer-events-none ${props.labelColor ? props.labelColor : 'text-white'}`}>{props.label}</p>
                }
            </div>
            <div className='flex flex-col'>
                {props.children}
                <div className='flex justify-center mt-6'>
                    <Toggle
                        state={darkMode}
                        onClick={() => reduxDispatcher(toggleDarkMode())}
                        onIcon='https://i.imgur.com/vlb61Uh.png'
                        offIcon='https://i.imgur.com/WlaCFSH.png'
                    />
                </div>
            </div>
        </div>
    )
}

export default Sidebar;