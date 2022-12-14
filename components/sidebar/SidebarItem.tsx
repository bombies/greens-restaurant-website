import Image from "next/image";
import Link from "next/link";
import { Url } from "url";
import {MouseEventHandler} from "react";
import { UserPermission } from "../../types/UserPermission";

type Props = {
    icon?: string,
    label: string,
    link?: string,
    onClick?: MouseEventHandler<HTMLDivElement>,
    textColor?: string,
    sidebarOpened: boolean
}

const SidebarItem = (props: Props) => {
    const generateElem = (): JSX.Element => {
        return (
            <div className={`flex gap-4 ${props.sidebarOpened ? 'justify-between' : 'justify-center'} transition-fast`} onClick={props.onClick}>
                {
                    props.icon &&
                    <div className={`relative ${!props.sidebarOpened ? 'w-8 h-8' : 'w-10 h-10'} self-center transition-fast`}>
                        <Image src={props.icon} alt='' fill={true} />
                    </div>
                }
                {
                    props.sidebarOpened &&
                    <p className={`transition-fast text-lg font-medium self-center overflow-hidden overflow-ellipsis text-${props.textColor ? `[${props.textColor}]` : 'white'}`}>{props.label}</p>
                }
            </div>
        )
    }

    return (
        <div className='hover:bg-neutral-800/25 rounded-sm transition-fast hover:cursor-pointer px-6 py-2'>
            {
                props.link ?
                    <Link href={`/${props.link}`} title={props.label}>
                        {generateElem()}
                    </Link>
                    :
                    generateElem()
            }
        </div>
    )
}

export default SidebarItem;