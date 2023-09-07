import * as React from "react";
import { IconProps } from "./icon-utils";
import clsx from "clsx";

const CheckIcon = ({ className, fill, width, height }: IconProps) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        className={clsx("self-center", className)}
        width={width ?? 24}
        height={height ?? width ?? 24}
        viewBox="0 0 32 32"
    >
        <path fill={clsx(fill ?? "currentColor")}
              d="m5 16.577 2.194-2.195 5.486 5.484L24.804 7.743 27 9.937l-14.32 14.32z" />
    </svg>
);
export default CheckIcon;
