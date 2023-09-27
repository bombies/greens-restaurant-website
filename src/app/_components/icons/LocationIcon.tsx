import * as React from "react";
import { IconProps } from "./icon-utils";
import clsx from "clsx";

const LocationIcon = ({ className, fill, width, height }: IconProps) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        className="self-center"
        xmlSpace="preserve"
        width={width ?? 24}
        height={height ?? width ?? 24}
        viewBox="0 0 64 64"
    >
        <path
            fill={clsx(fill ?? "currentColor")}
            className={clsx(className)}
            d="M32 0C18.746 0 8 10.746 8 24c0 5.219 1.711 10.008 4.555 13.93.051.094.059.199.117.289l16 24a4.001 4.001 0 0 0 6.656 0l16-24c.059-.09.066-.195.117-.289C54.289 34.008 56 29.219 56 24 56 10.746 45.254 0 32 0zm0 32a8 8 0 1 1 0-16 8 8 0 0 1 0 16z"
        />
    </svg>
);
export default LocationIcon;
