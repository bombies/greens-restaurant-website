import {MouseEventHandler} from "react";
import Image from "next/image";
import {ButtonType} from "../types/ButtonType";

type Props = {
    label?: string,
    icon?: string,
    onClick?: MouseEventHandler<HTMLDivElement>,
    isDisabled?: boolean,
    isWorking?: boolean,
    submitButton?: boolean,
    type: ButtonType
}

const Button = (props: Props) => {
    let buttonType: string;
    switch (props.type) {
        case ButtonType.PRIMARY: {
            buttonType = 'bg-green-500 text-white';
            break;
        }
        case ButtonType.SECONDARY: {
            buttonType = 'border-green-500 border-[1px] border-solid text-green-500';
            break;
        }
        case ButtonType.DANGER: {
            buttonType = 'bg-red-500 text-white';
            break;
        }
        case ButtonType.DANGER_SECONDARY: {
            buttonType = 'border-red-500 border-[1px] border-solid text-red-500';
            break;
        }
        case ButtonType.WARNING: {
            buttonType = 'bg-amber-600 text-white';
            break;
        }
    }

    return (
        <div>
            {
                props.submitButton ?
                    props.isWorking ?
                        <div className={`${props.isDisabled ? 'cursor-not-allowed brightness-75' : 'cursor-pointer hover:scale-105 '} 
                w-48 h-16 rounded-xl text-lg p-2 ${buttonType} flex justify-center transition-faster shadow-md`}>
                            <button className='pointer-events-none'>
                                <div className='animate-spin relative w-5 h-5'>
                                    <Image src='https://i.imgur.com/oQkKuvH.png' alt='' layout='fill' />
                                </div>
                            </button>
                        </div>

                        :
                        <input type='submit' className={`${props.isDisabled ? 'cursor-not-allowed brightness-75' : 'cursor-pointer hover:scale-105 '} 
                        w-44 h-16 rounded-xl text-lg p-4 ${buttonType} flex justify-center transition-faster shadow-md`} onClick={props.isDisabled ? () => {} : undefined} disabled={props.isDisabled} />
                        :
                        <div
                            onClick={props.isDisabled === true ? () => {} : props.onClick}
                            className={`${props.isDisabled ? 'cursor-not-allowed brightness-75' : 'cursor-pointer hover:scale-105 '} 
                w-48 h-16 rounded-xl text-lg p-2 ${buttonType} flex justify-center transition-faster shadow-md`}
                        >
                        <button className='pointer-events-none'>
                            {
                                props.isWorking !== true ?
                                    (
                                        <div className='flex gap-2'>
                                            {
                                                props.icon &&
                                                <div className='relative h-5 w-5 self-center'>
                                                    <Image src={props.icon} alt='' layout='fill' />
                                                </div>
                                            }
                                            {
                                                props.label &&
                                                <p className='self-center pointer-events-none'>{props.label}</p>
                                            }
                                        </div>
                                    )
                                    :
                                    (
                                        <div className='animate-spin relative w-5 h-5'>
                                            <Image src='https://i.imgur.com/oQkKuvH.png' alt='' layout='fill' />
                                        </div>
                                    )
                            }
                        </button>
                    </div>
            }
        </div>

    )
}

export default Button