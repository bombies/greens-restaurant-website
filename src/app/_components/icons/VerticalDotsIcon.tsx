import * as React from "react";
import { IconProps } from "./icon-utils";
import clsx from "clsx";

const VerticalDotsIcon = ({ className, fill, width, height }: IconProps) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        xmlSpace="preserve"
        className={clsx("self-center", className)}
        width={width ?? 24}
        height={height ?? width ?? 24}
        style={{
            fillRule: "evenodd",
            clipRule: "evenodd",
            strokeLinejoin: "round",
            strokeMiterlimit: 2
        }}
        viewBox="0 0 64 64"
    >
        <path
            d="M-256-64h1280v800H-256z"
            style={{
                fill: "none"
            }}
        />
        <g
            fill={clsx(fill ?? "currentColor")}
        >
            <circle cx={32.026} cy={12.028} r={4} />
            <circle cx={32.026} cy={52.028} r={4} />
            <circle cx={32.026} cy={32.028} r={4} />
        </g>

    </svg>
);
export default VerticalDotsIcon;
