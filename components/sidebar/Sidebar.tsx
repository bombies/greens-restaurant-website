import Image from "next/image";
import Link from "next/link";
import React, { MouseEventHandler, useState } from "react";

interface Props extends React.PropsWithChildren {
    icon?: string,
    label?: string,
    labelColor?: string,
    color: string,
    sidebarOpened: boolean,
    toggleSidebar: MouseEventHandler<HTMLDivElement>
}

const Sidebar = (props: Props) => {

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
            </div>
        </div>
    )
}

export default Sidebar;