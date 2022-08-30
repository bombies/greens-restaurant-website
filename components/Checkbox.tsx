import { MouseEventHandler } from "react";

type Props = {
    state: boolean,
    label: string,
    onClick?: MouseEventHandler<HTMLDivElement>
}

const CheckBox = (props: Props) => {
    return (
        <div onClick={props.onClick} className='flex gap-2'>
            <div className={`rounded-md self-center w-4 h-4 border-[1px] border-neutral-700 ${props.state ? 'bg-green-500 shadow-sm shadow-green-400 border-none' : 'bg-neutral-100'}`}></div>
            <p className='text-white font-sm'>{props.label}</p>
        </div>
    )
}

export default CheckBox;