import { MouseEventHandler } from "react";
import Image from "next/image";

type Props = {
    label: string;
    icon?: string;
    onClick?: () => void;
};

const ButtonDropDownItem = (props: Props) => {
    return (
        <div
            className="transition-fast hover:bg-neutral-200/70 hover:dark:bg-neutral-900/70 p-2 flex justify-center gap-4 cursor-pointer"
            onClick={() => {
                if (!props.onClick)
                    return;
                props.onClick();
            }}
        >
            {props.icon && (
                <div className="relative w-4 h-4 self-center">
                    <Image src={props.icon} alt="" layout="fill" />
                </div>
            )}
            <p className='text-center text-sm'>{props.label}</p>
        </div>
    );
};

export default ButtonDropDownItem;
