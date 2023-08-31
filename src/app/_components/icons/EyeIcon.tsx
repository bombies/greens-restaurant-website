import * as React from "react";
import { IconProps } from "./icon-utils";
import clsx from "clsx";

const EyeIcon = ({ className, fill, width, height }: IconProps) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        xmlSpace="preserve"
        className={clsx("self-center", className)}
        width={width ?? 24}
        height={height ?? width ?? 24}
        viewBox="0 0 64 64"
    >
        <path
            fill={clsx(fill ?? "currentColor")}
            d="M63.714 30.516C63.347 29.594 54.448 8 31.999 8S.651 29.594.284 30.516a4.019 4.019 0 0 0 0 2.969C.651 34.406 9.55 56 31.999 56s31.348-21.594 31.715-22.516a4.016 4.016 0 0 0 0-2.968zM31.999 40a8 8 0 1 1 0-16 8 8 0 0 1 0 16z"
        />
    </svg>
);
export default EyeIcon;
