import React from "react";
import clsx from "clsx";

interface Props extends React.PropsWithChildren {
    className?: string;
    thick?: boolean;
}

export default function SubTitle({ thick, className, children }: Props) {
    return <h3 className={clsx(
        "text-2xl text-neutral-300 tracking-wider phone:text-xl w-fit mb-3",
        thick ? "font-semibold" : "font-light",
        className
    )}>{children}</h3>;
}