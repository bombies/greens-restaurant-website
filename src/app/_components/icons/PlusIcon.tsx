import * as React from "react";
import { IconProps } from "./icon-utils";
import clsx from "clsx";

const PlusIcon = ({ className, fill, width, height }: IconProps) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        className={clsx("self-center", className)}
        width={width ?? 24}
        height={height ?? width ?? 24}
        fill="none"
        viewBox="0 0 24 24"
    >
        <path
            fill={clsx(fill ?? "#000")}
            fillRule="evenodd"
            d="M13 6a1 1 0 1 0-2 0v5H6a1 1 0 1 0 0 2h5v5a1 1 0 1 0 2 0v-5h5a1 1 0 1 0 0-2h-5V6Z"
            clipRule="evenodd"
        />
    </svg>
);
export default PlusIcon;
