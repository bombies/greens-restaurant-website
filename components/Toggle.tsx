import {MouseEventHandler} from "react";
import Image from "next/image";

type Props = {
    state: boolean,
    offIcon?: string,
    onIcon?: string,
    onClick: MouseEventHandler<HTMLDivElement>,
    isDisabled?: boolean,
}

const Toggle = (props: Props) => {
    return (
        <div
            className='relative w-14 h-6 bg-white dark:bg-neutral-700 rounded-full cursor-pointer transition-fast'
            onClick={props.onClick}
        >
            <div className={`absolute w-6 h-6 bg-green-600 rounded-full border-2 border-white shadow-md dark:border-neutral-700 ${props.state ? 'right-0' : ''}`}>
                {
                    props.offIcon && props.onIcon &&
                    <div className='relative w-3 h-3 mx-auto mt-1'>
                        <Image src={`${props.state ? props.onIcon : props.offIcon}`} alt='' fill={true} />
                    </div>
                }
            </div>
        </div>
    )
}

export default Toggle;