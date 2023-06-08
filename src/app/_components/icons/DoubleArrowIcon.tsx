import * as React from "react"
import { SVGProps } from "react"
const DoubleArrowIcon = (props: SVGProps<SVGSVGElement>) => (
    <svg
        className={props.className}
        xmlns="http://www.w3.org/2000/svg"
        width={props.width || "1em"}
        height={props.width || "1em"}
        {...props}
        viewBox="0 0 24 24"
    >
        <g fill={props.fill || "#fff"} fillRule="evenodd" clipRule="evenodd">
            <path d="M12.293 7.293a1 1 0 0 1 1.414 0l4 4a1 1 0 0 1 0 1.414l-4 4a1 1 0 0 1-1.414-1.414L15.586 12l-3.293-3.293a1 1 0 0 1 0-1.414Z" />
            <path d="M6.293 7.293a1 1 0 0 1 1.414 0l4 4a1 1 0 0 1 0 1.414l-4 4a1 1 0 0 1-1.414-1.414L9.586 12 6.293 8.707a1 1 0 0 1 0-1.414Z" />
        </g>
    </svg>
)
export default DoubleArrowIcon
