"use client";

import { useCallback } from "react";
import { Stock, StockSnapshot, StockType } from "@prisma/client";
import { QuantityUnit } from "./StockQuantityDropdown";

type Props = {
    item?: Stock | StockSnapshot
}

const IMPERIAL_DRINKS_MAX = 33;
const QUART_DRINKS_MAX = 24;
const SIX_CASE_MAX = 6;
const TWELVE_CASE_MAX = 12;
const TWENTY_FOUR_CASE_MAX = 24;


const useStockQuantityDropdownUtils = ({ item }: Props) => {
    const isCaseItem = useCallback(() => {
        return [StockType.SIX_CASE.toString(), StockType.TWELVE_CASE.toString(), StockType.TWENTY_FOUR_CASE.toString()]
            .includes(item?.type?.toString() ?? "");
    }, [item?.type]);

    const isDrinkBottle = useCallback(() => (
        item?.type === StockType.IMPERIAL_BOTTLE || item?.type === StockType.QUART_BOTTLE
    ), [item?.type]);

    const mutateQuantity = useCallback((quantity: number, quantityUnit: QuantityUnit) => {
        let newQuantity = quantity;

        if (quantityUnit === QuantityUnit.BOTTLES.toLowerCase())
            switch (item?.type) {
                case StockType.QUART_BOTTLE: {
                    newQuantity *= QUART_DRINKS_MAX;
                    break;
                }
                case StockType.IMPERIAL_BOTTLE: {
                    newQuantity *= IMPERIAL_DRINKS_MAX;
                    break;
                }
                default: {
                    break;
                }
            }
        else if (quantityUnit === QuantityUnit.CASES.toLowerCase())
            switch (item?.type) {
                case StockType.SIX_CASE: {
                    newQuantity *= SIX_CASE_MAX;
                    break;
                }
                case StockType.TWELVE_CASE: {
                    newQuantity *= TWELVE_CASE_MAX;
                    break;

                }
                case StockType.TWENTY_FOUR_CASE: {
                    newQuantity *= TWENTY_FOUR_CASE_MAX;
                    break;
                }
                default: {
                    break;
                }
            }

        return newQuantity;
    }, [item?.type]);

    return { isCaseItem, mutateQuantity, isDrinkBottle };
};

export default useStockQuantityDropdownUtils;