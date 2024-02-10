"use client";

import SlidingBar from "./SlidingBar";
import clsx from "clsx";
import ChangesMadeContainer, { ChangesMadeContainerProps } from "./ChangesMadeContainer";

type Props = {
    className?: string
} & ChangesMadeContainerProps

export default function ChangesMadeBar({ className, changesMade, ...props }: Props) {
    return (
        <SlidingBar visible={changesMade} className={clsx(className, "justify-between")}>
            <ChangesMadeContainer {...props} changesMade={changesMade} />
        </SlidingBar>
    );
}