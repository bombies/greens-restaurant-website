import * as React from "react"
import { SVGProps } from "react"
const InventoryIcon = (props: SVGProps<SVGSVGElement>) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={props.width || "1em"}
        height={props.width || "1em"}
        viewBox="0 0 24 24"
        {...props}
        fill="none"
    >
        <path
            className={props.className}
            fill={props.fill || "#fff"}
            fillRule="evenodd"
            d="M0 4.6A2.6 2.6 0 0 1 2.6 2h18.8A2.6 2.6 0 0 1 24 4.6v.8A2.6 2.6 0 0 1 21.4 8H21v10.6c0 1.33-1.07 2.4-2.4 2.4H5.4C4.07 21 3 19.93 3 18.6V8h-.4A2.6 2.6 0 0 1 0 5.4v-.8ZM2.6 4a.6.6 0 0 0-.6.6v.8a.6.6 0 0 0 .6.6h18.8a.6.6 0 0 0 .6-.6v-.8a.6.6 0 0 0-.6-.6H2.6ZM8 10a1 1 0 1 0 0 2h8a1 1 0 1 0 0-2H8Z"
            clipRule="evenodd"
        />
    </svg>
)
export default InventoryIcon
