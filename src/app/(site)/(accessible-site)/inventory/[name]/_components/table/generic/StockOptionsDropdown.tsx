"use client";

import { DropdownItem, DropdownMenu, DropdownSection } from "@nextui-org/react";
import { Key } from "react";
import TrashIcon from "../../../../../../../_components/icons/TrashIcon";
import PlusIcon from "../../../../../../../_components/icons/PlusIcon";
import MinusIcon from "../../../../../../../_components/icons/MinusIcon";

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
                <DropdownSection title="Actions" showDivider>
                    <DropdownItem
                        key="add"
                        description="Add a custom amount of stock to this item"
                        startContent={<PlusIcon />}
                    >
                        Add Multiple
                    </DropdownItem>
                    <DropdownItem
                        key="remove"
                        description="Remove a custom amount of stock from this item"
                        startContent={<MinusIcon />}
                    >
                        Remove Multiple
                    </DropdownItem>
                </DropdownSection>
                <DropdownSection title="Danger Zone">
                    <DropdownItem
                        key="delete"
                        className="text-danger hover:text-white"
                        color="danger"
                        startContent={<TrashIcon />}
                    >
                        Remove Item
                    </DropdownItem>
                </DropdownSection>
            </DropdownMenu>
        </>
    );
}