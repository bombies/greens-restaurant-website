"use client";

import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Selection } from "@nextui-org/react";
import { useMemo } from "react";
import { StaticImageData } from "next/image";
import GenericImage from "../GenericImage";

export type DropdownInputProps = {
    label?: string,
    variant?: "light" | "shadow" | "flat" | "solid" | "bordered" | "faded" & Partial<"ghost">
    multiSelect?: boolean,
    selectionRequired?: boolean,
    keys: string[],
    selectedKeys: string[],
    setSelectedKeys: (keys: Selection) => any
    icon?: string | StaticImageData
    disabled?: boolean,
    selectedValueLabel?: boolean
    labelIsIcon?: boolean
}

export default function DropdownInput({
                                          label,
                                          variant,
                                          multiSelect,
                                          selectionRequired,
                                          keys,
                                          selectedKeys,
                                          setSelectedKeys,
                                          disabled,
                                          icon,
                                          selectedValueLabel,
                                          labelIsIcon
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
        <>
            {label && <p>{label}</p>}
            <Dropdown>
                <DropdownTrigger>
                    <Button
                        isIconOnly={labelIsIcon}
                        variant={variant}
                        disabled={disabled}
                        color="primary"
                        className="capitalize"
                        endContent={icon && <GenericImage src={icon} width={1} />}
                    >
                        {selectedValueLabel && selectedValue}
                    </Button>
                </DropdownTrigger>
                <DropdownMenu
                    color="primary"
                    variant={variant}
                    disallowEmptySelection={selectionRequired}
                    selectedKeys={selectedKeys}
                    onSelectionChange={setSelectedKeys}
                    selectionMode={multiSelect ? "multiple" : "single"}
                    disabledKeys={disabled ? keys : undefined}
                >
                    {keyElements}
                </DropdownMenu>
            </Dropdown>
        </>
    );
}