import {ChangeEvent, ChangeEventHandler} from "react";

type Props = {
    placeholder?: string,
    value: string,
    onChange: ChangeEventHandler<HTMLInputElement>
    width?:  number,
    height?: number
}

const TextBox = (props: Props) => {
    return (
        <input
            type='text'
            placeholder={props.placeholder}
            value={props.value}
            onChange={props.onChange}
            style={{ width : `${props.width || 'inherit'}`, height: `${props.height || 'inherit'}` }}
        />
    )
}

export default TextBox;