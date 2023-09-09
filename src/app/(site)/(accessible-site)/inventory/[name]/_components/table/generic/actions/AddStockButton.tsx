"use client";

import { FC, Fragment } from "react";
import { StockSnapshot } from "@prisma/client";
import PlusIcon from "../../../../../../../../_components/icons/PlusIcon";
import IconButton from "../../../../../../../../_components/inputs/IconButton";

type Props = {
    item: StockSnapshot,
    onQuantityIncrement: (item: StockSnapshot, incrementedBy: number) => Promise<void>,
}

const AddStockButton: FC<Props> = ({ item, onQuantityIncrement }) => {
    return (
        <IconButton
            size="sm"
            variant="flat"
            toolTip="Increment"
            cooldown={1}
            onPress={async () => {
                await onQuantityIncrement(item, 1);
            }}
        >
            <PlusIcon width={16} />
        </IconButton>
    );
};

export default AddStockButton;