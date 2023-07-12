"use client";

import { Button, Link, Popover, PopoverContent, PopoverTrigger } from "@nextui-org/react";
import React from "react";
import { Badge } from "@nextui-org/badge";
import infoIcon from "/public/icons/info.svg";
import GenericImage from "./GenericImage";

type Props = {
    href: string,
    toolTip?: string | React.ReactNode,
} & React.PropsWithChildren

export default function LinkCard({ href, children, toolTip }: Props) {
    const button = (
        <Button
            href={href}
            as={Link}
            className={"h-fit w-full !default-container !p-6 transition-fast hover:-translate-y-1 hover:!border-primary !flex justify-start"}>
            {children}
        </Button>
    );

    return toolTip ?
        (
            <Popover classNames={{
                base: "bg-neutral-900/80 backdrop-blur-md border-1 border-white/20"
            }}>
                <PopoverTrigger>
                    <Badge
                        color="secondary"
                        variant="shadow"
                        content={<GenericImage src={infoIcon} width={1.15} />}
                        size="lg"
                        disableOutline
                        className="cursor-pointer transition-fast hover:-translate-y-5 rounded-full p-1"
                    >
                        {button}
                    </Badge>
                </PopoverTrigger>
                <PopoverContent>
                    {toolTip}
                </PopoverContent>
            </Popover>
        )
        :
        button;
}