"use client";

import { DropdownItem, DropdownMenu, Spacer } from "@nextui-org/react";
import { Key } from "react";
import { Divider } from "@nextui-org/divider";

type Props = {
    onAdd: () => void,
    onRemove: () => void,
    onDelete: () => void,
    disabled?: boolean,
}

export default function StockOptionsDropdown({ onAdd, onRemove, onDelete, disabled }: Props) {

    const handleAction = (key: Key) => {
        switch (key) {
            case "add": {
                onAdd();
                break;
            }
            case "remove": {
                onRemove();
                break;
            }
            case "delete": {
                onDelete();
                break;
            }
        }
    };

    return (
        <>
            <DropdownMenu
                aria-labelledby="Stock Options Dropdown"
                onAction={handleAction}
                disabledKeys={disabled ? ["add", "remove", "delete"] : undefined}
            >
                <DropdownItem key="add" description="Add a custom amount of stock to this item">Add
                    Multiple</DropdownItem>
                <DropdownItem key="remove" description="Remove a custom amount of stock from this item">Remove
                    Multiple</DropdownItem>
                <DropdownItem
                    key="delete"
                    className="text-danger hover:text-white"
                    color="danger"
                >
                    <Divider />
                    <Spacer y={3} />
                    Remove Item
                </DropdownItem>
            </DropdownMenu>
        </>
    );
}