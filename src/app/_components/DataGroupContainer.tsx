import clsx from "clsx";
import React from "react";

type DataGroupContainerProps = {
    direction?: "horizontal" | "vertical"
} & React.PropsWithChildren

export function DataGroupContainer({ direction, children }: DataGroupContainerProps) {
    return (
        <div className={clsx(
            "flex phone:flex-col gap-12 p-3",
            direction === "vertical" ? "flex-col" : ""
        )}>
            {children}
        </div>
    );
}