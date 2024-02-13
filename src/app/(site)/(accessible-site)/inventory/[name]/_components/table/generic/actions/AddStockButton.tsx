"use client";

import { FC, Fragment, ReactElement } from "react";
import { StockSnapshot } from "@prisma/client";
import PlusIcon from "../../../../../../../../_components/icons/PlusIcon";
import IconButton from "../../../../../../../../_components/inputs/IconButton";

type Props = {
    item: StockSnapshot,
    onQuantityIncrement: (item: StockSnapshot, incrementedBy: number) => Promise<void>,
    step?: number,
    icon?: ReactElement,
    toolTipContent?: string,
}

const AddStockButton: FC<Props> = ({ item, onQuantityIncrement, step, icon, toolTipContent }) => {
    return (
        <IconButton
            size="sm"
            variant="flat"
            toolTip={toolTipContent || "Increment"}
            cooldown={1}
            onPress={async () => {
                await onQuantityIncrement(item, step ?? 1);
            }}
        >
            {icon ?? <PlusIcon width={16} />}
        </IconButton>
    );
};

export default AddStockButton;