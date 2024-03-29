import { Config, StockRequestStatus, StockSnapshot, StockType } from "@prisma/client";
import { DeepRequired } from "react-hook-form";
import { StockRequestWithOptionalCreator } from "../_components/requests/inventory-requests-utils";

export const LowStockThreshold = {
    flaskDrink: StockType.FLASK_DRINK,
    imperialBottle: StockType.IMPERIAL_BOTTLE,
    quartBottle: StockType.QUART_BOTTLE,
    twelveCase: StockType.TWELVE_CASE,
    twentyFourCase: StockType.TWENTY_FOUR_CASE,
    sixCase: StockType.SIX_CASE,
    default: StockType.DEFAULT
}

export const itemHasLowStock = (config: DeepRequired<Config>, item: StockSnapshot): boolean => {
    switch (item.type) {
        case StockType.FLASK_DRINK: {
            return item.quantity <= config.inventoryConfig.lowStockThresholds.flaskDrink;
        }
        case StockType.IMPERIAL_BOTTLE: {
            return item.quantity <= config.inventoryConfig.lowStockThresholds.imperialBottle;
        }
        case StockType.IMPERIAL_BOTTLE: {
            return item.quantity <= config.inventoryConfig.lowStockThresholds.quartBottle;
        }
        case StockType.TWELVE_CASE: {
            return item.quantity <= config.inventoryConfig.lowStockThresholds.twelveCase;
        }
        case StockType.TWENTY_FOUR_CASE: {
            return item.quantity <= config.inventoryConfig.lowStockThresholds.twentyFourCase;
        }
        case StockType.SIX_CASE: {
            return item.quantity <= config.inventoryConfig.lowStockThresholds.sixCase;
        }
        case StockType.DEFAULT: {
            return item.quantity <= config.inventoryConfig.lowStockThresholds.default;
        }
        default: {
            return item.quantity <= config.inventoryConfig.lowStockThresholds.default;
        }
    }
}

export const stockTypeToValue = (stockType: StockType): number => {
    switch (stockType) {
        case StockType.FLASK_DRINK:
            return 24
        case StockType.IMPERIAL_BOTTLE:
            return 33
        case StockType.QUART_BOTTLE:
            return 24
        case StockType.TWELVE_CASE:
            return 12
        case StockType.TWENTY_FOUR_CASE:
            return 24
        case StockType.SIX_CASE:
            return 6
        default:
            return 1
    }
}

export const getInventoryRequestDisplayDate = (req: StockRequestWithOptionalCreator) =>
    (req.status !== StockRequestStatus.PENDING) ? (req.deliveredAt ?? req.createdAt) : req.createdAt
