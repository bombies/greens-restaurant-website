import React from "react";

interface Props extends React.PropsWithChildren {
    isHeading?: boolean;
    id?: string;
}

const TableRow = (props: Props) => {
    return (
        <tr
            className={`${
                props.isHeading || " odd:bg-green-50 dark:odd:bg-green-600/10"
            }`}
            id={props.id}
        >
            {props.children}
        </tr>
    );
};

export default TableRow;