import * as React from "react"
import { SVGProps } from "react"
const BackIcon = (props: SVGProps<SVGSVGElement>) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={props.width || "1em"}
        height={props.width || "1em"}
        fill="none"
        viewBox="0 0 24 24"
        {...props}
    >
        <path
            className={props.className}
            fill={props.fill || "#fff"}
            d="m4 10-.707.707L2.586 10l.707-.707L4 10Zm17 8a1 1 0 1 1-2 0h2ZM8.293 15.707l-5-5 1.414-1.414 5 5-1.414 1.414Zm-5-6.414 5-5 1.414 1.414-5 5-1.414-1.414ZM4 9h10v2H4V9Zm17 7v2h-2v-2h2Zm-7-7a7 7 0 0 1 7 7h-2a5 5 0 0 0-5-5V9Z"
        />
    </svg>
)
export default BackIcon
