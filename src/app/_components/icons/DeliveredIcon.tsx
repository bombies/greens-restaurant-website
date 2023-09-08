import * as React from "react";
import { IconProps } from "./icon-utils";
import clsx from "clsx";

const DeliveredIcon = ({ className, fill, width, height }: IconProps) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        xmlSpace="preserve"
        className={clsx("self-center", className)}
        width={width ?? 24}
        height={height ?? width ?? 24}
        viewBox="0 0 32 32"
    >
        <g
            fill={clsx(fill ?? "currentColor")}
        >
            <path
                d="M25 3H11c-1.1 0-2 .9-2 2v10.6c1.2-.4 2.5-.6 3.9-.6H19c1.6 0 3 1.3 3 2.9v.4c1.3-1.6 3.1-2.7 5-3.1V5c0-1.1-.9-2-2-2zm-1.3 6.8c-.2.2-.4.3-.7.3-.3 0-.5-.1-.7-.3l-.3-.3V12c0 .6-.4 1-1 1s-1-.4-1-1V9.5l-.3.3c-.4.4-1 .4-1.4 0-.4-.4-.4-1 0-1.4l2-2.1c.4-.4 1.1-.4 1.5 0l2 2.1c.3.4.3 1.1-.1 1.4z" />
            <path
                d="M29.9 17.5c-.2-.3-.5-.5-.9-.5-2.2 0-4.3 1-5.6 2.8l-.9 1.2c-1.1 1.3-2.8 2-4.5 2h-3c-.6 0-1-.4-1-1s.4-1 1-1h1.9c1.6 0 3.1-1.3 3.1-2.9V18c0-.5-.5-1-1-1h-6.1c-3.6 0-6.5 1.6-8.1 4.2l-2.7 4.2c-.2.3-.2.7 0 1l3 5c.1.2.4.4.6.5h.2c.2 0 .4-.1.6-.2 3.8-2.5 8.2-3.8 12.7-3.8 3.3 0 6.3-1.8 7.9-4.7l2.7-4.8c.2-.2.2-.6.1-.9z" />
        </g>
    </svg>
);
export default DeliveredIcon;
