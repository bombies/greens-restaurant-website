"use client";

import { FC, ReactElement } from "react";
import { StockSnapshot } from "@prisma/client";
import IconButton from "../../../../../../../../_components/inputs/IconButton";
import MinusIcon from "../../../../../../../../_components/icons/MinusIcon";

type Props = {
    item: StockSnapshot,
    onQuantityDecrement: (item: StockSnapshot, decrementedBy: number) => Promise<void>,
    step?: number,
    icon?: ReactElement,
    toolTipContent?: string
}

const RemoveStockButton: FC<Props> = ({ item, onQuantityDecrement, step, icon, toolTipContent }) => {
    return (
        <IconButton
            size="sm"
            variant="flat"
            color="danger"
            toolTip={toolTipContent || "Decrement"}
            cooldown={1}
            onPress={async () => {
                await onQuantityDecrement(item, step ?? 1);
            }}
        >
            {icon ?? <MinusIcon width={16} />}
        </IconButton>
    );
};

export default RemoveStockButton;