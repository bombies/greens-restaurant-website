import React from "react";

interface Props extends React.PropsWithChildren {
    className?: string
}

const Table = (props: Props) => {
    return (
        <table className={`border-collapse border-[1px] border-solid border-opacity-100 w-full ${props.className || ''}`}>
            {props.children}
        </table>
    )
}

export default Table;