"use client";

import { useCallback } from "react";
import { StockType } from "@prisma/client";
import { QuantityUnit } from "./StockQuantityDropdown";

type Props = {
    itemType?: StockType | null
}

const IMPERIAL_DRINKS_MAX = 33;
const QUART_DRINKS_MAX = 24;
const SIX_CASE_MAX = 6;
const TWELVE_CASE_MAX = 12;
const TWENTY_FOUR_CASE_MAX = 24;


export const isCaseType = (itemType: StockType | null = null) => {
    return [StockType.SIX_CASE.toString(), StockType.TWELVE_CASE.toString(), StockType.TWENTY_FOUR_CASE.toString()]
        .includes(itemType?.toString() ?? "");
}

export const isDrinkBottleType = (itemType: StockType | null = null) => (
    itemType === StockType.IMPERIAL_BOTTLE || itemType === StockType.QUART_BOTTLE
)

export const mutateQuantityUnit = (itemType: StockType | null | undefined, quantity: number, quantityUnit: QuantityUnit) => {
    let newQuantity = quantity;

    if (quantityUnit === QuantityUnit.BOTTLES.toLowerCase())
        switch (itemType) {
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
        switch (itemType) {
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
}

const useStockQuantityDropdownUtils = ({ itemType }: Props) => {
    const isCaseItem = useCallback(() => isCaseType(itemType), [itemType]);
    const isDrinkBottle = useCallback(() => isDrinkBottleType(itemType), [itemType]);
    const mutateQuantity = useCallback((quantity: number, quantityUnit: QuantityUnit) => mutateQuantityUnit(itemType, quantity, quantityUnit), [itemType]);
    return { isCaseItem, mutateQuantity, isDrinkBottle };
};

export default useStockQuantityDropdownUtils;