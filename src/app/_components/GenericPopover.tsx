"use client";

import { FC, PropsWithChildren, ReactNode } from "react";
import { Popover, PopoverContent, PopoverProps, PopoverTrigger } from "@nextui-org/react";
import clsx from "clsx";

type Props = Omit<PopoverProps, "children"> & {
    trigger: ReactNode,
} & PropsWithChildren

const GenericPopover: FC<Props> = ({ trigger, children, ...props }) => {
    return (
        <Popover
            {...props}
            // className={clsx("bg-neutral-900/80 backdrop-blur-md border-1 border-white/20 p-6", props.className)}
        >
            <PopoverTrigger>
                {trigger}
            </PopoverTrigger>
            <PopoverContent className="bg-neutral-900/80 backdrop-blur-md border-1 border-white/20 p-6">
                {children}
            </PopoverContent>
        </Popover>
    );
};

export default GenericPopover;