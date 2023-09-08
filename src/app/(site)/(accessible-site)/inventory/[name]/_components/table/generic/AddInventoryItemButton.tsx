"use client";

import { FC, Fragment } from "react";
import IconButton from "../../../../../../../_components/inputs/IconButton";
import PlusIcon from "../../../../../../../_components/icons/PlusIcon";

type Props = {
    onPress: () => void,
}

const AddInventoryItemButton: FC<Props> = ({ onPress }) => {
    return (
        <IconButton
            variant="flat"
            toolTip="Add Item"
            onPress={onPress}
        >
            <PlusIcon />
        </IconButton>
    );
};

export default AddInventoryItemButton;