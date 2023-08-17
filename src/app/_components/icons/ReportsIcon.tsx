import * as React from "react";
import { IconProps } from "./icon-utils";
import clsx from "clsx";

const ReportsIcon = ({ className, fill, width, height }: IconProps) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        className={clsx("self-center", className)}
        width={width ?? 24}
        height={height ?? width ?? 24}
        viewBox="0 0 36 36"
    >
        <g fill={clsx(fill ?? "#000")}>
            <rect width={5.76} height={11.52} x={6.48} y={18} rx={1} ry={1} />
            <rect width={5.76} height={23.04} x={15.12} y={6.48} rx={1} ry={1} />
            <rect width={5.76} height={15.36} x={23.76} y={14.16} rx={1} ry={1} />
        </g>
    </svg>
);
export default ReportsIcon;
