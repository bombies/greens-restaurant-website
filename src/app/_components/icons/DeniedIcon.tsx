import * as React from "react";
import { IconProps } from "./icon-utils";
import clsx from "clsx";

const DeniedIcon = ({ className, fill, width, height }: IconProps) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        xmlSpace="preserve"
        className={clsx("self-center", className)}
        width={width ?? 24}
        height={height ?? width ?? 24}
        viewBox="0 0 329.328 329.328"
    >
        <path
            fill={clsx(fill ?? "currentColor")}
            d="M164.666 0C73.871 0 .004 73.871.004 164.672c.009 90.792 73.876 164.656 164.662 164.656 90.793 0 164.658-73.865 164.658-164.658C329.324 73.871 255.459 0 164.666 0zm0 30c31.734 0 60.933 11.042 83.975 29.477L59.478 248.638c-18.431-23.04-29.471-52.237-29.474-83.967C30.004 90.413 90.413 30 164.666 30zm0 269.328c-31.733 0-60.934-11.042-83.977-29.477l189.165-189.16c18.431 23.043 29.471 52.244 29.471 83.979-.001 74.251-60.408 134.658-134.659 134.658z" />
    </svg>
);
export default DeniedIcon;
