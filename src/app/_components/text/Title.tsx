import React from "react";
import clsx from "clsx";

interface Props extends React.PropsWithChildren {
    className?: string;
}

export default function Title({ children, className }: Props) {
    return <h1 className={clsx(className, "phone:text-3xl w-fit")}>{children}</h1>;
}