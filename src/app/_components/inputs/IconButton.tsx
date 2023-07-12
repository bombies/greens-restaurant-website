import { Button, ButtonProps, Dropdown, DropdownMenuProps, DropdownTrigger, Tooltip } from "@nextui-org/react";
import ComponentColor from "../ComponentColor";
import { StaticImageData } from "next/image";
import GenericImage from "../GenericImage";
import React, { ReactElement } from "react";
import { UseDropdownProps } from "@nextui-org/dropdown/dist/use-dropdown";
import { DropdownInputProps } from "./DropdownInput";

type Props = {
    toolTip: string,
    icon: string | StaticImageData;
    width?: number
    withDropdown?: ReactElement<DropdownMenuProps> | ReactElement<DropdownInputProps>
    dropdownProps?: UseDropdownProps
} & ButtonProps

export default function IconButton({ toolTip, icon, color, width, withDropdown, dropdownProps, ...buttonProps }: Props) {
    const button = (
        <Button {...buttonProps} isIconOnly variant={buttonProps.variant || "light"} color={color || "secondary"}>
            <GenericImage className="self-center" src={icon} width={width || 1.35} />
        </Button>
    );

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
            <Tooltip
                as="button"
                content={toolTip}
                color={color}
                closeDelay={100}
            >
                {button}
            </Tooltip>

    );
}