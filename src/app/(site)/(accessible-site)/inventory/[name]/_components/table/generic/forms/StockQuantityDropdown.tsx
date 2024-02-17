"use client";

import { Dispatch, FC, SetStateAction, useCallback, useMemo } from "react";
import { Stock, StockSnapshot, StockType } from "@prisma/client";
import DropdownInput from "../../../../../../../../_components/inputs/DropdownInput";
import useStockQuantityDropdownUtils from "./useStockQuantityDropdownUtils";

export enum QuantityUnit {
    DRINKS = "Drinks",
    BOTTLES = "Bottles",
    CASES = "Cases",
    ITEMS = "Items",
    DEFAULT = "Default",
}

type Props = {
    itemType?: StockType | null,
    selectedUnit: QuantityUnit,
    setSelectedUnit: Dispatch<SetStateAction<QuantityUnit>>
}

const StockQuantityDropdown: FC<Props> = ({ itemType, selectedUnit, setSelectedUnit }) => {
    const { isCaseItem } = useStockQuantityDropdownUtils({ itemType });

    const validKeys = useMemo(() => (
        isCaseItem() ?
            [QuantityUnit.CASES, QuantityUnit.ITEMS]
            :
            [QuantityUnit.BOTTLES, QuantityUnit.DRINKS]
    ), [isCaseItem]);

    return (
        <DropdownInput
            selectedValueLabel
            selectionRequired
            variant="flat"
            keys={validKeys}
            selectedKeys={selectedUnit === QuantityUnit.DEFAULT ? [isCaseItem() ? QuantityUnit.ITEMS : QuantityUnit.DRINKS] : [selectedUnit]}
            setSelectedKeys={(keys) => setSelectedUnit(Array.from(keys)[0] as QuantityUnit)}
        />
    );
};

export default StockQuantityDropdown;