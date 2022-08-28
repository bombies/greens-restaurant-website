import {MouseEventHandler} from "react";

type Props = {
    title: string,
    className?: string,
    onClick?: MouseEventHandler<HTMLDivElement>
}

const TableHeader = (props: Props) => {
    return (
        <th
            className={`border-[1px] border-solid border-opacity-100 dark:text-white ${props.onClick ? 'cursor-pointer' : ''} ${props.className ? props.className : ''}`}
            onClick={props.onClick}
        >
                {props.title}
        </th>
    )
}

export default TableHeader;