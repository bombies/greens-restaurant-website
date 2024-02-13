"use client";

import SlidingBar from "./SlidingBar";
import clsx from "clsx";
import ChangesMadeContainer, { ChangesMadeContainerProps } from "./ChangesMadeContainer";
import { cn } from "@nextui-org/react";

type Props = {
    className?: string
} & ChangesMadeContainerProps

export default function ChangesMadeBar({ className, changesMade, ...props }: Props) {
    return (
        <SlidingBar visible={changesMade} className={cn("justify-between gap-4", className)}>
            <ChangesMadeContainer {...props} changesMade={changesMade} />
        </SlidingBar>
    );
}