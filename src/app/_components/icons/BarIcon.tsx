import * as React from "react";
import { IconProps } from "./icon-utils";
import clsx from "clsx";

const BarIcon = ({ className, fill, width, height }: IconProps) => (
    <svg
        xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14"
        className={clsx("self-center", className)}
        width={width ?? 24}
        height={height ?? width ?? 24}
    >
        <path
            className={clsx("self-center", className)}
            d="M3 0C2 0 2 .467 2 1v2c0 1-2 1-2 3v7c0 .566.467 1 1 1h4c.6 0 1-.4 1-1V6c0-2-2-2-2-3V1c0-.566 0-1-1-1zm4 5c0 3 .471 5 3 5v2c0 .667-1 1-1.5 1-1 0-1.5 0-1.5 1h7c0-1-.5-1-1.5-1-.5 0-1.5-.366-1.5-1v-2c2.471 0 3-2 3-5H7z"
            style={{
                fill: clsx(fill ?? "currentColor"),
                fillOpacity: 1,
                stroke: "none"
            }}
        />
    </svg>
);
export default BarIcon;
