"use client";

import { Button, Link, Tooltip, TooltipProps } from "@nextui-org/react";
import React from "react";

type Props = {
    href: string,
    toolTip?: string | React.ReactNode,
    toolTipProps?: Omit<TooltipProps, "content">
} & React.PropsWithChildren

export default function LinkCard({ href, children, toolTip, toolTipProps }: Props) {
    const button = (
        <Button
            href={href}
            as={Link}
            className={"h-fit !default-container !p-6 transition-fast hover:-translate-y-1 hover:!border-primary !flex justify-start"}>
            {children}
        </Button>
    );

    return toolTip ?
        (
            <Tooltip
                content={toolTip}
                {...toolTipProps}
            >
                {button}
            </Tooltip>
        )
        :
        button;
}