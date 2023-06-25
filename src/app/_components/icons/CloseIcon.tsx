import * as React from "react"
import { SVGProps } from "react"
const CloseIcon = (props: SVGProps<SVGSVGElement>) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={800}
        height={800}
        fill="none"
        stroke="#000"
        viewBox="0 0 24 24"
        {...props}
    >
        <path
            stroke={props.fill || '#fff'}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="m18 18-6-6m0 0L6 6m6 6 6-6m-6 6-6 6"
        />
    </svg>
)
export default CloseIcon
