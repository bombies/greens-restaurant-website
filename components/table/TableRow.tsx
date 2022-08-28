import React from "react";

interface Props extends React.PropsWithChildren {
    isHeading?: boolean
}

const TableRow = (props: Props) => {
    return (
        <tr className={`${props.isHeading || ' odd:bg-green-50 dark:odd:bg-green-600/10'}`}>
            {
                props.children
            }
        </tr>
    )
}

export default TableRow;