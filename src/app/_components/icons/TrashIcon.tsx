import * as React from "react";
import { IconProps } from "./icon-utils";
import clsx from "clsx";

const TrashIcon = ({ className, fill, width, height }: IconProps) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        className={clsx("self-center", className)}
        width={width ?? 24}
        height={height ?? width ?? 24}
        fill="none"
        viewBox="0 0 24 24"
    >
        <g fill={clsx(fill ?? "currentColor")}>
            <path
                d="M8 1.5v1H3a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1v-1a1 1 0 0 0-1-1h-5v-1a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1ZM3.923 7.5h16.154l-.943 12.722A3 3 0 0 1 16.143 23H7.857a3 3 0 0 1-2.992-2.778L3.923 7.5Z" />
        </g>
    </svg>
);
export default TrashIcon;
