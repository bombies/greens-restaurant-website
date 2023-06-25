import * as React from "react"
import { SVGProps } from "react"
const InvoiceIcon = (props: SVGProps<SVGSVGElement>) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        className={props.className}
        width={props.width || "1em"}
        height={props.width || "1em"}
        fill={props.fill || "#fff"}
        stroke={props.fill || "#fff"}
        viewBox="0 0 24 24"
        {...props}
    >
        <path d="M19 12h3v8a2 2 0 0 1-2 2h-1Zm-2-8v18H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2Zm-7 12H5v2h5Zm4-5H5v2h9Zm0-5H5v2h9Z" />
    </svg>
)
export default InvoiceIcon
