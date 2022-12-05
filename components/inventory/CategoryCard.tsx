import Link from "next/link";
import {MouseEventHandler} from "react";
import Image from "next/image";

type Props = {
    name: string,
    uid: string,
    removeMode: boolean
    onRemove: MouseEventHandler<HTMLDivElement>;
}

const CategoryCard = (props: Props) => {
    return (
        <div className='relative transition-fast hover:scale-105 w-3/4'>
            {
                props.removeMode ?
                    <div onClick={props.onRemove}>
                        <div
                            className={`absolute w-6 h-6 top-[-10px] left-[-10px] bg-red-500 rounded-full hover:scale-125 transition-fast`}
                        >
                            <div className='relative w-3 h-3 mx-auto mt-1.5'>
                                <Image src='https://i.imgur.com/qNlanxv.png' alt='' fill={true} />
                            </div>
                        </div>
                        <div
                            className={`absolute w-6 h-6 top-[-10px] left-[-10px] bg-red-500 rounded-full transition-fast ${props.removeMode ? 'animate-ping' : ''}`}
                        >
                            <div className='relative w-3 h-3 mx-auto mt-1.5'>
                                <Image src='https://i.imgur.com/qNlanxv.png' alt='' fill={true} />
                            </div>
                        </div>
                        <div className='h-12 flex items-center justify-center bg-green-400 dark:bg-green-600 rounded-xl shadow-md border-opacity-10 hover:border-opacity-100'>
                            <p className='text-xl dark:text-white tracking-wider text-center overflow-hidden overflow-ellipsis pointer-events-none'>{props.name}</p>
                        </div>
                    </div>
                    :
                    <Link href={`/inventory/${props.uid}`}>
                        <div className='h-12 flex items-center justify-center bg-green-400 dark:bg-green-600 rounded-xl shadow-md border-opacity-10 hover:border-opacity-100'>
                            <p className='text-xl dark:text-white tracking-wider text-center overflow-hidden overflow-ellipsis pointer-events-none'>{props.name}</p>
                        </div>
                    </Link>
            }
        </div>

    )
};

export default CategoryCard;