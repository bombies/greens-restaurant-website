import {MouseEventHandler} from "react";

type Props = {
    state: boolean,
    leftIcon?: string,
    rightIcon?: string,
    onClick: MouseEventHandler<HTMLDivElement>,
    isDisabled?: boolean,
}

const Toggle = (props: Props) => {
    return (
        <div>

        </div>
    )
}

export default Toggle;