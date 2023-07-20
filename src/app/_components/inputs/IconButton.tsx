import { Button, ButtonProps, Dropdown, DropdownMenuProps, DropdownTrigger, Tooltip } from "@nextui-org/react";
import { StaticImageData } from "next/image";
import GenericImage from "../GenericImage";
import React, { ReactElement, useCallback, useMemo, useState } from "react";
import { UseDropdownProps } from "@nextui-org/dropdown/dist/use-dropdown";
import { DropdownInputProps } from "./DropdownInput";
import { sendToast } from "../../../utils/Hooks";

type Props = {
    toolTip?: string,
    icon: string | StaticImageData;
    width?: number
    withDropdown?: ReactElement<DropdownMenuProps> | ReactElement<DropdownInputProps>
    dropdownProps?: UseDropdownProps
    cooldown?: number
} & ButtonProps

export default function IconButton({
                                       toolTip,
                                       icon,
                                       color,
                                       width,
                                       withDropdown,
                                       dropdownProps,
                                       cooldown,
                                       ...buttonProps
                                   }: Props) {
    const [lastClick, setLastClick] = useState<number>();

    const isOnCoolDown = useCallback((): boolean => {
        if (cooldown === undefined)
            return false;
        if (lastClick === undefined)
            return false;

        const curTime = new Date().getTime();
        return curTime - lastClick <= (cooldown * 1000);
    }, [cooldown, lastClick]);

    const button = useMemo(() => (
        <Button
            {...buttonProps}
            isIconOnly
            variant={buttonProps.variant || "light"}
            color={color || "secondary"}
            onPress={(e) => {
                if (!isOnCoolDown()) {
                    if (buttonProps.onPress)
                        buttonProps.onPress(e);
                    setLastClick(new Date().getTime());
                } else {
                    sendToast({
                        title: "Slow down!",
                        description: `Woah there! This button is on cooldown. You may use it again in 
                        ${(Math.abs(new Date().getTime() - (lastClick! + (cooldown! * 1000))) / 1000).toFixed(Math.abs(new Date().getTime() - (lastClick! + (cooldown! * 1000))) / 1000 < 1 ? 2 : 0)}
                         seconds!`
                    }, {
                        position: "top-right"
                    });
                }
            }}
        >
            <GenericImage className="self-center" src={icon} width={width || 1.35} />
        </Button>
    ), [buttonProps, color, cooldown, icon, isOnCoolDown, lastClick, width]);

    return (
        withDropdown ?
            <Dropdown
                aria-labelledby="IconButton Dropdown"
                {...dropdownProps}
            >
                <DropdownTrigger>
                    {button}
                </DropdownTrigger>
                {withDropdown}
            </Dropdown>
            :
            (
                toolTip ?
                    <Tooltip
                        as="button"
                        content={toolTip}
                        color={color}
                        closeDelay={100}
                    >
                        {button}
                    </Tooltip>
                    :
                    button
            )

    );
}