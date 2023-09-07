"use client";

import React, { FC, ReactElement } from "react";
import {
    Button, ButtonProps,
    CheckboxGroup, CheckboxGroupProps, CheckboxProps,
    Popover,
    PopoverContent,
    PopoverProps,
    PopoverTrigger
} from "@nextui-org/react";

type Props = Omit<PopoverProps, "children"> & {
    buttonProps?: ButtonProps,
    checkboxGroupProps?: CheckboxGroupProps,
    children: ReactElement<CheckboxProps> | ReactElement<CheckboxProps>[]
}

const CheckboxMenu: FC<Props> = ({ buttonProps, checkboxGroupProps, children, ...popoverProps }) => {
    return (
        <Popover
            {...popoverProps}
            classNames={{
                base: "bg-neutral-900/80 backdrop-blur-md border-1 border-white/20 p-6",
                ...popoverProps.classNames
            }}
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
            <PopoverContent>
                <CheckboxGroup
                    {...checkboxGroupProps}
                    color={checkboxGroupProps?.color ?? "secondary"}
                >
                    {children}
                </CheckboxGroup>
            </PopoverContent>
        </Popover>
    );
};

export default CheckboxMenu;