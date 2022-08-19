import {MouseEventHandler} from "react";
import Image from "next/image";

type Props = {
    label?: string,
    icon?: string,
    onClick: MouseEventHandler<HTMLDivElement>,
    isDisabled?: boolean,
    type: 'primary' | 'secondary' | 'danger' | 'warning'
}

const Button = (props: Props) => {
    let buttonType: string;
    switch (props.type) {
        case 'primary': {
            buttonType = 'bg-green-500 text-white';
            break;
        }
        case 'secondary': {
            buttonType = 'border-green-500 border-[1px] border-solid text-green-500';
            break;
        }
        case 'danger': {
            buttonType = 'bg-red-500 text-white';
            break;
        }
        case 'warning': {
            buttonType = 'bg-amber-600 text-white';
            break;
        }
    }

    return (
        <div
            onClick={props.onClick}
            className={`${props.isDisabled && 'cursor-not-allowed pointer-events-none brightness-50'} 
            w-32 h-10 rounded-xl text-xl ${buttonType} flex justify-center hover:cursor-pointer transition-faster hover:scale-105`}
        >
            <button>
                {
                    props.icon &&
                    <div className='relative h-12 w-12 self-center'>
                        <Image src={props.icon} alt='' layout='fill' />
                    </div>
                }
                {
                    props.label &&
                    <p className='self-center'>{props.label}</p>
                }
            </button>
        </div>
    )
}

export default Button