import {MouseEventHandler} from "react";
import Image from "next/image";

type Props = {
    title: string,
    className?: string,
    onClick?: MouseEventHandler<HTMLDivElement>
    sortMode?: '0' | '1' | '2'
}

const TableHeader = (props: Props) => {
    return (
        <th
            className={`border-[1px] border-solid border-opacity-100 dark:border-neutral-700 dark:text-white ${props.onClick ? 'cursor-pointer hover:brightness-105 transition-faster' : 'pointer-events-none'} ${props.className ? props.className : ''}`}
            onClick={props.onClick}
        >
            <div className='flex justify-center gap-2'>
                {props.title}
                {
                    props.sortMode && props.sortMode !== '0' &&
                    <div className='relative w-6 h-6 self-center brightness-0 dark:brightness-100'>
                        <Image src={props.sortMode === '1' ? 'https://i.imgur.com/PdtXRah.png' : 'https://i.imgur.com/FeGpxiw.png'} alt='' fill={true} />
                    </div>
                }
            </div>
        </th>
    )
}

export default TableHeader;