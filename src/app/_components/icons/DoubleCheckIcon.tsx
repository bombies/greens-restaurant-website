import * as React from "react";
import { IconProps } from "./icon-utils";
import clsx from "clsx";

const DoubleCheckIcon = ({ className, fill, width, height }: IconProps) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={width ?? 24}
        height={height ?? width ?? 24}
        fill="none"
        viewBox="0 0 24 24"
        className={clsx("self-center", className)}
    >
        <path
            stroke={clsx(fill ?? "currentColor")}
            strokeLinecap="round"
            strokeWidth={1.5}
            d="m1.5 12.5 4.076 4.076a.6.6 0 0 0 .848 0L9 14M16 7l-4 4"
        />
        <path
            stroke={clsx(fill ?? "currentColor")}
            strokeLinecap="round"
            strokeWidth={1.5}
            d="m7 12 4.576 4.576a.6.6 0 0 0 .848 0L22 7"
        />
    </svg>
);
export default DoubleCheckIcon;
