"use client";

import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Selection } from "@nextui-org/react";
import { useMemo } from "react";
import { StaticImageData } from "next/image";
import GenericImage from "../GenericImage";
import clsx from "clsx";

export type DropdownInputProps = {
    label?: string,
    labelPlacement?: "beside" | "above",
    fallbackTriggerLabel?: string,
    color?: "primary" | "secondary" | "success" | "danger" | "warning"
    isLoading?: boolean,
    variant?: "light" | "shadow" | "flat" | "solid" | "bordered" | "faded" & Partial<"ghost">
    multiSelect?: boolean,
    selectionRequired?: boolean,
    keys: string[],
    selectedKeys: string[],
    setSelectedKeys: (keys: Selection) => any
    icon?: string | StaticImageData
    disabled?: boolean,
    selectedValueLabel?: boolean
    labelIsIcon?: boolean,
    buttonClassName?: string
}

export default function DropdownInput({
                                          label,
                                          labelPlacement,
                                          fallbackTriggerLabel,
                                          variant,
                                          multiSelect,
                                          selectionRequired,
                                          keys,
                                          selectedKeys,
                                          setSelectedKeys,
                                          disabled,
                                          icon,
                                          selectedValueLabel,
                                          color,
                                          labelIsIcon,
                                          isLoading,
                                          buttonClassName
                                      }: DropdownInputProps) {
    const keyElements = keys.map(key => (
        <DropdownItem
            key={key.toLowerCase().replaceAll(" ", "_")}
            className="capitalize"
        >
            {key}
        </DropdownItem>
    ));


    const selectedValue = useMemo(
        () =>
            selectedKeys
                .map((key) => key.toString().replace("_", " "))
                .join(", "),
        [selectedKeys]
    );

    return (
        <div className={clsx("flex gap-6", labelPlacement === "above" && "flex-col")}>
            {label &&
                <label
                    className="default-container px-8 py-2 w-fit mx-auto uppercase text-[.75rem] tracking-tight font-semibold">{label}</label>}
            <Dropdown
                classNames={{
                    base: "bg-neutral-900/80 backdrop-blur-md border-1 border-white/20 p-6"
                }}
            >
                <DropdownTrigger>
                    <Button
                        fullWidth
                        isIconOnly={labelIsIcon}
                        variant={variant}
                        disabled={disabled || isLoading}
                        isLoading={isLoading}
                        color={color || "primary"}
                        className={clsx("capitalize", buttonClassName)}
                        endContent={icon && <GenericImage src={icon} width={1.5} />}
                    >
                        {(selectedValueLabel && selectedValue) || fallbackTriggerLabel}
                    </Button>
                </DropdownTrigger>
                <DropdownMenu
                    color={color || "primary"}
                    variant={variant}
                    disallowEmptySelection={selectionRequired}
                    selectedKeys={selectedKeys}
                    closeOnSelect={!multiSelect}
                    onSelectionChange={setSelectedKeys}
                    selectionMode={multiSelect ? "multiple" : "single"}
                    disabledKeys={(disabled || isLoading) ? keys : undefined}
                >
                    {keyElements}
                </DropdownMenu>
            </Dropdown>
        </div>
    );
}