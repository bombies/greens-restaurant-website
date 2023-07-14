"use client";

import { Toast } from "react-hot-toast";
import { StaticImageData } from "next/image";
import GenericImage from "./GenericImage";
import clsx from "clsx";
import { JSX } from "react";

type Props = {
    toastObj: Toast
    data: ToastDataProps
}

export type ToastDataProps = {
    title?: string,
    description: string,
    icon?: string | StaticImageData
    svgIcon?: JSX.Element
}

export default function ToastComponent(props: Props) {
    const { title, description, icon, svgIcon } = props.data;
    return (
        <div
            className={clsx(`
                dark:bg-dark/50
                rounded-xl
                bg-neutral-200/75
                backdrop-blur-sm p-6
                min-w-96 max-w-[32rem]
                flex
                gap-4
                justify-between`,
                props.toastObj.visible ? "animate-enter" : "animate-leave"
            )}
        >
            {icon && <GenericImage className="self-center" src={icon} width={1.5} />}
            <div className="self-center">
                {
                    title && <h3 className="text-primary text-xl font-semibold">{title}</h3>
                }
                <p className="dark:text-white text-black">{description}</p>
            </div>
        </div>
    );
}