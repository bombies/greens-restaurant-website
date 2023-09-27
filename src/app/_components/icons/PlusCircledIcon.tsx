import * as React from "react";
import { IconProps } from "./icon-utils";
import clsx from "clsx";

const PlusCircledIcon = ({ className, fill, width, height }: IconProps) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        className={clsx("self-center")}
        width={width ?? 24}
        height={height ?? width ?? 24}
        viewBox="0 0 32 32"
    >
        <title>{"plus-circle"}</title>
        <path
            fill={clsx(fill ?? "currentColor")}
            className={clsx(className)}
            fillRule="evenodd"
            d="M22 17h-5v5a1.001 1.001 0 0 1-2 0v-5h-5a1.001 1.001 0 0 1 0-2h5v-5a1.001 1.001 0 0 1 2 0v5h5a1.001 1.001 0 0 1 0 2ZM16 0C7.163 0 0 7.16 0 16s7.163 16 16 16 16-7.16 16-16S24.837 0 16 0Z"
        />
    </svg>
);
export default PlusCircledIcon;
