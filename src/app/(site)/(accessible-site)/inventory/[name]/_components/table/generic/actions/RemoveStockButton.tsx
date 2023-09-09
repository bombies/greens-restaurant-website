"use client";

import { FC } from "react";
import { StockSnapshot } from "@prisma/client";
import IconButton from "../../../../../../../../_components/inputs/IconButton";
import MinusIcon from "../../../../../../../../_components/icons/MinusIcon";

type Props = {
    item: StockSnapshot,
    onQuantityDecrement: (item: StockSnapshot, decrementedBy: number) => Promise<void>,
}

const RemoveStockButton: FC<Props> = ({ item, onQuantityDecrement }) => {
    return (
        <IconButton
            size="sm"
            variant="flat"
            color="danger"
            toolTip="Decrement"
            cooldown={1}
            onPress={async () => {
                await onQuantityDecrement(item, 1);
            }}
        >
            <MinusIcon width={16} />
        </IconButton>
    );
};

export default RemoveStockButton;