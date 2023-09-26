import * as React from "react";
import { IconProps } from "./icon-utils";
import clsx from "clsx";

const SignOutIcon = ({ className, fill, width, height }: IconProps) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        className={clsx("icon flat-color self-center")}
        width={width ?? 24}
        height={height ?? width ?? 24}
        data-name="Flat Color"
        viewBox="0 0 24 24"
    >
        <g
            className={clsx(className)}
            fill={clsx(fill ?? "currentColor")}
        >
            <path
                d="M9 11H5.41l1.3-1.29a1 1 0 0 0-1.42-1.42l-3 3a1 1 0 0 0 0 1.42l3 3a1 1 0 0 0 1.42 0 1 1 0 0 0 0-1.42L5.41 13H9a1 1 0 0 0 0-2Z"
            />
            <path
                d="m20.48 3.84-6-1.5A2 2 0 0 0 12 4.28V5h-2a2 2 0 0 0-2 2v1a1 1 0 0 0 2 0V7h2v10h-2v-1a1 1 0 0 0-2 0v1a2 2 0 0 0 2 2h2v.72a2 2 0 0 0 2.48 1.94l6-1.5A2 2 0 0 0 22 18.22V5.78a2 2 0 0 0-1.52-1.94Z"
            />
        </g>

    </svg>
);
export default SignOutIcon;
