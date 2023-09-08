import * as React from "react";
import { IconProps } from "./icon-utils";
import clsx from "clsx";

const SearchIcon = ({ className, fill, width, height }: IconProps) => (
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
            d="m15 15 6 6m-11-4a7 7 0 1 1 0-14 7 7 0 0 1 0 14Z"
        />
    </svg>
);
export default SearchIcon;
