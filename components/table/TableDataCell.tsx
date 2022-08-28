import React from "react";

interface Props extends React.PropsWithChildren {
    className?: string
}

const TableDataCell = (props: Props) => {
    return (
        <td className={`border-[1px] border-solid border-opacity-100 p-3 dark:text-white ${props.className || ''}`}>
            {
                props.children
            }
        </td>
    )
}

export default TableDataCell;