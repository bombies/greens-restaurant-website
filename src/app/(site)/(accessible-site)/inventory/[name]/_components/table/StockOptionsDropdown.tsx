"use client";

import { DropdownItem, DropdownMenu } from "@nextui-org/react";
import { Key } from "react";

type Props = {
    onAdd: () => void,
    onRemove: () => void,
    onDelete: () => void,
}

export default function StockOptionsDropdown({ onAdd, onRemove, onDelete }: Props) {

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
            >
                <DropdownItem key="add" description="Add a custom amount of stock to this item">Add
                    Multiple</DropdownItem>
                <DropdownItem key="remove" description="Remove a custom amount of stock from this item">Remove
                    Multiple</DropdownItem>
                <DropdownItem
                    key="delete"
                    showDivider
                    className="text-danger hover:text-white"
                    color="danger"
                >
                    Remove Item
                </DropdownItem>
            </DropdownMenu>
        </>
    );
}