import * as React from "react";
import { IconProps } from "./icon-utils";
import clsx from "clsx";

const MinusIcon = ({ className, fill, width, height }: IconProps) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        className={clsx("self-center", className)}
        width={width ?? 24}
        height={height ?? width ?? 24}
        fill="none"
        viewBox="0 0 24 24"
    >
        <path
            stroke={clsx(fill ?? "currentColor")}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 12h12"
        />
    </svg>
);
export default MinusIcon;
