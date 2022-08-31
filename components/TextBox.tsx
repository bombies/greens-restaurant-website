import {ChangeEvent, ChangeEventHandler} from "react";

type Props = {
    placeholder?: string,
    value?: string | number,
    onChange?: ChangeEventHandler<HTMLInputElement>
    width?:  number,
    height?: number,
    passwordBox?: boolean,
    numbersOnly?: boolean,
}

const TextBox = (props: Props) => {
    return (
        <input
            className='rounded-lg border-green-500/30 shadow-[0_0_5px_1px_rgba(0,0,0,0.25)] pl-2 focus:outline-none dark:bg-neutral-200 transition-faster'
            type={props.passwordBox === true ? 'password' : props.numbersOnly === true ? 'number' : 'text'}
            placeholder={props.placeholder}
            value={props.value}
            onChange={props.onChange}
            style={{ width : `${props.width || 'inherit'}`, height: `${props.height || 'inherit'}` }}
        />
    )
}

export default TextBox;