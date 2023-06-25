import * as React from "react";
import { SVGProps } from "react";

const UsersIcon = (props: SVGProps<SVGSVGElement>) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={props.width || "1em"}
        height={props.width || "1em"}
        viewBox="0 0 24 24"
        {...props}
        fill="none"
    >
        <g className={props.className} fill={props.fill || "#fff"}>
            <path
                d="M1.5 6.5a5.5 5.5 0 1 1 11 0 5.5 5.5 0 0 1-11 0ZM14.5 6.5c0 1.5-.44 2.898-1.2 4.07a5.5 5.5 0 1 0 0-8.14 7.465 7.465 0 0 1 1.2 4.07ZM0 18a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v4a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1v-4ZM16 18v5h7a1 1 0 0 0 1-1v-4a4 4 0 0 0-4-4h-5.528A5.978 5.978 0 0 1 16 18Z" />
        </g>
    </svg>
);
export default UsersIcon;
