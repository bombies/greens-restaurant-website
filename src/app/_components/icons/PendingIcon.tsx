import * as React from "react";
import { IconProps } from "./icon-utils";
import clsx from "clsx";

const PendingIcon = ({ className, fill, width, height }: IconProps) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        id="icon"
        className={clsx("self-center", className)}
        width={width ?? 24}
        height={height ?? width ?? 24}
        fill={clsx(fill ?? "currentColor")}
        viewBox="0 0 32 32"
    >
        <defs>
            <style>{".cls-1{fill:none}"}</style>
        </defs>
        <path
            d="M16 2a14 14 0 1 0 14 14A14 14 0 0 0 16 2ZM8 18a2 2 0 1 1 2-2 2 2 0 0 1-2 2Zm8 0a2 2 0 1 1 2-2 2 2 0 0 1-2 2Zm8 0a2 2 0 1 1 2-2 2 2 0 0 1-2 2Z" />
        <path
            id="inner-path"
            d="M10 16a2 2 0 1 1-2-2 2 2 0 0 1 2 2Zm6-2a2 2 0 1 0 2 2 2 2 0 0 0-2-2Zm8 0a2 2 0 1 0 2 2 2 2 0 0 0-2-2Z"
            className="cls-1"
        />
        <path
            id="_Transparent_Rectangle_"
            d="M0 0h32v32H0z"
            className="cls-1"
            data-name="&lt;Transparent Rectangle&gt;"
        />
    </svg>
);
export default PendingIcon;
