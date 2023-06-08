import React from "react";
import ComponentSize from "../ComponentSize";
import ComponentColor from "../ComponentColor";
import { StaticImageData } from "next/image";
import clsx from "clsx";
import GenericImage from "../GenericImage";
import Spinner from "../../../components/Spinner";

interface Props extends React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> {
    size?: ComponentSize;
    color?: ComponentColor;
    shadow?: boolean;
    icon?: string | StaticImageData;
    iconPlacement?: "left" | "right";
    fullWidth?: boolean;
    bordered?: boolean;
    loading?: boolean
}

export default function GenericButton(props: Props) {
    let size: string;
    switch (props.size) {
        case "xs": {
            size = "h-10 w-40"
            break;
        }
        case "sm": {
            size = "h-12 w-48"
            break;
        }
        case "md": {
            size = "h-16 w-64"
            break;
        }
        case "lg": {
            size = "h-[4.5rem] w-72"
            break;
        }
        default: {
            size = "h-12 w-48"
            break;
        }
    }

    let color: string;
    switch (props.color) {
        case "primary": {
            color = props.bordered ? "border-2 bg-none border-primary text-primary" : "bg-primary"
            if (props.shadow)
                color += ' shadow-primary/50'
            break;
        }
        case "secondary": {
            color = props.bordered ? "border-2 bg-none border-secondary text-secondary" : "bg-secondary"
            if (props.shadow)
                color += ' shadow-secondary/50'
            break;
        }
        case "warning": {
            color = props.bordered ? "border-2 bg-none border-warning text-warning" : "bg-warning"
            if (props.shadow)
                color += ' shadow-warning/50'
            break;
        }
        case "danger": {
            color = props.bordered ? "border-2 bg-none border-danger text-danger" : "bg-danger"
            if (props.shadow)
                color += ' shadow-danger/50'
            break;
        }
        default: {
            color = props.bordered ? "border-2 bg-none border-primary text-primary" : "bg-primary"
            if (props.shadow)
                color += ' shadow-primary/50'
            break;
        }
    }

    const button =
        <button
            {...props}
            className={clsx(
                'z-0 rounded-xl self-center cursor-pointer transition-fast hover:-translate-y-[.25rem] disabled:opacity-50 disabled:cursor-not-allowed',
                size,
                color,
                props.shadow ? 'shadow-lg' : '',
                props.fullWidth ? '!w-full' : ''
            )}
        >
            <div className="flex justify-center gap-4">
                {
                    props.loading ?
                        <Spinner size={1.25} />
                        :
                        <div className={clsx(
                            "flex justify-center gap-4 self-center my-auto text-white",
                            props.iconPlacement === "right" ? "flex-row-reverse" : "")
                        }>
                            {props.icon && <GenericImage className='self-center' src={props.icon} width={1.25} />}
                            {props.children}
                        </div>
                }
            </div>
        </button>;

    return (button);
}