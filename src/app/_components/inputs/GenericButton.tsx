"use client"

import React, { useCallback, useMemo, useState } from "react";
import { StaticImageData } from "next/image";
import clsx from "clsx";
import GenericImage from "../GenericImage";
import { Button, ButtonProps } from "@nextui-org/react";
import { PressEvent } from "@react-types/shared";
import { toast } from "react-hot-toast";

type Props =
    ButtonProps
    & {
        icon?: string | StaticImageData;
        cooldown?: number
    }

export default function GenericButton({ icon, cooldown, children, className, ...props }: Props) {
    const [lastClick, setLastClick] = useState<number>();

    const isOnCoolDown = useCallback((): boolean => {
        if (cooldown === undefined)
            return false;
        if (lastClick === undefined)
            return false;

        const curTime = new Date().getTime();
        return curTime - lastClick <= (cooldown * 1000);
    }, [cooldown, lastClick]);

    const button = useMemo(() =>
        <Button
            {...props}
            color={props.color || "primary"}
            variant={props.variant || "shadow"}
            size={props.size || "lg"}
            startContent={icon ? <GenericImage src={icon} width={1.35} /> : props.startContent}
            className={clsx(
                "z-0 rounded-xl self-center cursor-pointer transition-fast hover:-translate-y-[.25rem] disabled:opacity-50 disabled:cursor-not-allowed p-6",
                className
            )}
            onPress={(e: PressEvent) => {
                if (!isOnCoolDown()) {
                    if (props.onPress)
                        props.onPress(e);
                    setLastClick(new Date().getTime());
                } else {
                    toast(`Woah there! This button is on cooldown. You may use it again in 
                            ${(Math.abs(new Date().getTime() - (lastClick! + (cooldown! * 1000))) / 1000).toFixed(Math.abs(new Date().getTime() - (lastClick! + (cooldown! * 1000))) / 1000 < 1 ? 2 : 0)}
                            seconds!`, {
                        position: "top-right"
                    });
                }
            }}
        >
            {children}
        </Button>
        , [children, className, cooldown, icon, isOnCoolDown, lastClick, props]);

    return (button);
}