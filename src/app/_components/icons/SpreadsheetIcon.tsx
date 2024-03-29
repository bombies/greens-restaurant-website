import * as React from "react";
import { IconProps } from "./icon-utils";
import clsx from "clsx";

const SpreadsheetIcon = ({ className, fill, width, height }: IconProps) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        className={clsx("self-center", className)}
        width={width ?? 24}
        height={height ?? width ?? 24}
        fill="none"
        viewBox="0 0 15 15"
    >
        <path
            fill={clsx(fill ?? "#000")}
            d="M10 7.995V10H8V7.995h2ZM10 4.997v1.998H8V4.997h2ZM7 4.997H5v1.998h2V4.997ZM7 7.995H5V10h2V7.995Z"
        />
        <path
            fill={clsx(fill ?? "#000")}
            fillRule="evenodd"
            d="M1 1.5A1.5 1.5 0 0 1 2.5 0h8.207L14 3.293V13.5a1.5 1.5 0 0 1-1.5 1.5h-10A1.5 1.5 0 0 1 1 13.5v-12Zm10 2.497H4V11h7V3.997Z"
            clipRule="evenodd"
        />
    </svg>
);
export default SpreadsheetIcon;
