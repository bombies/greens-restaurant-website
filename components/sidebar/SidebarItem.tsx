import Image from "next/image";
import Link from "next/link";
import { Url } from "url";

type Props = {
    icon?: string,
    label: string,
    link: string,
    textColor?: string,
    sidebarOpened: boolean
}

const SidebarItem = (props: Props) => {
    return (
        <div className='hover:bg-neutral-800/25 rounded-sm transition-fast hover:cursor-pointer px-6 py-2'>
            <Link href={props.link}>
                <div className={`flex gap-4 ${props.sidebarOpened ? 'justify-between' : 'justify-center'} transition-fast`}>
                    {
                        props.icon &&
                        <div className='relative w-10 h-10 self-center transition-fast'>
                            <Image src={props.icon} alt='' layout='fill' />
                        </div>
                    }
                    {
                        props.sidebarOpened &&
                        <p className={`transition-fast text-lg font-medium self-center text-${props.textColor ? `[${props.textColor}]` : 'white'}`}>{props.label}</p>
                    }
                </div>
            </Link>
        </div>
    )
}

export default SidebarItem;