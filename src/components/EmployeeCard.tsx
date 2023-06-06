import Image from "next/image";
import Link from "next/link";
import { MouseEventHandler } from "react";

type Props = {
    username: string,
    first_name: string,
    last_name: string,
    avatar?: string | null,
    permissions: number,
    removeMode: boolean,
    onRemove: MouseEventHandler<HTMLDivElement>;
}

const EmployeeCard = (props: Props) => {
    return (
        <div className='relative w-full min-h-fit hover:scale-105 transition-fast'>
            {
                props.removeMode && <div
                    className={`absolute z-10 w-6 h-6 top-[-10px] left-[-10px] bg-red-500 rounded-full hover:scale-125 transition-fast`}
                    onClick={props.onRemove}
                >
                    <div className='relative w-3 h-3 mx-auto mt-1.5'>
                        <Image src='https://i.imgur.com/qNlanxv.png' alt='' fill={true} />
                    </div>
                </div>

            }
            <Link href={`/employees/${props.username}`} >
                <div className='p-3 bg-green-500 dark:bg-green-600  rounded-xl drop-shadow-md '>
                    <div className='flex gap-4'>
                        <div className='relative rounded-full border-2 border-white w-16 h-16 drop-shadow-md'>
                            <Image src={props.avatar || "https://i.imgur.com/V2EC9kV.jpg"} alt={''} fill={true} className='rounded-full' />
                        </div>
                        <div className='self-center overflow-hidden'>
                            <p className='max-w-[15rem] uppercase font-bold text-2xl tracking-widest pointer-events-none text-white drop-shadow-md overflow-hidden overflow-ellipsis'>{props.first_name} {props.last_name}</p>
                            <p className={'text-neutral-100'}>{props.username}</p>
                        </div>
                    </div>

                </div>
            </Link>
        </div>
    )
}

export default EmployeeCard;