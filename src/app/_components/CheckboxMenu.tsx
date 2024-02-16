"use client";

import React, { FC, ReactElement } from "react";
import {
    Button, ButtonProps,
    CheckboxGroup, CheckboxGroupProps, CheckboxProps,
    Popover,
    PopoverContent,
    PopoverProps,
    PopoverTrigger,
    ScrollShadow
} from "@nextui-org/react";
import clsx from "clsx";

type Props = Omit<PopoverProps, "children"> & {
    buttonProps?: ButtonProps,
    checkboxGroupProps?: CheckboxGroupProps,
    children: ReactElement<CheckboxProps> | ReactElement<CheckboxProps>[],
    maxHeight?: string
}

const CheckboxMenu: FC<Props> = ({ buttonProps, checkboxGroupProps, children, maxHeight, ...popoverProps }) => {
    return (
        <Popover
            {...popoverProps}
            className={clsx("bg-neutral-950/0", popoverProps.className)}
            placement={popoverProps.placement ?? "bottom"}
        >
            <PopoverTrigger>
                <Button
                    {...buttonProps}
                    isIconOnly={buttonProps?.isIconOnly ?? true}
                    variant={buttonProps?.variant ?? "flat"}
                    color={buttonProps?.color ?? "primary"}
                >
                    {buttonProps?.children}
                </Button>
            </PopoverTrigger>
            <PopoverContent
                className={clsx("!default-container backdrop-blur-lg p-6")}
            >
                <ScrollShadow
                    hideScrollBar
                    style={{
                        maxHeight: maxHeight ?? "fit-content"
                    }}
                >
                    <CheckboxGroup
                        {...checkboxGroupProps}
                        color={checkboxGroupProps?.color ?? "secondary"}
                    >
                        {children}
                    </CheckboxGroup>
                </ScrollShadow>
            </PopoverContent>
        </Popover>
    );
};

export default CheckboxMenu;