"use client";

import { DropdownItem, DropdownMenu, DropdownSection } from "@nextui-org/react";
import { Key } from "react";
import addIcon from "/public/icons/add.svg";
import trashIcon from "/public/icons/red-trash.svg";
import subtractIcon from "/public/icons/subtract.svg";
import GenericImage from "../../../../../../_components/GenericImage";

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
                        startContent={<GenericImage src={addIcon} width={1.35} />}
                    >
                        Add Multiple
                    </DropdownItem>
                    <DropdownItem
                        key="remove"
                        description="Remove a custom amount of stock from this item"
                        startContent={<GenericImage src={subtractIcon} width={1.35} />}
                    >
                        Remove Multiple
                    </DropdownItem>
                </DropdownSection>
                <DropdownSection title="Danger Zone">
                    <DropdownItem
                        key="delete"
                        className="text-danger hover:text-white"
                        color="danger"
                        startContent={<GenericImage src={trashIcon} width={1.15} />}
                    >
                        Remove Item
                    </DropdownItem>
                </DropdownSection>
            </DropdownMenu>
        </>
    );
}