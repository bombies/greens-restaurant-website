import { compare, mergeDeepWithArrayReplace } from "@/utils/GeneralUtils";
import { Config, InventoryConfig } from "@prisma/client";
import { DeepRequired } from "react-hook-form";
import { UpdateConfigDto, UpdateConfigDtoSchema } from "./types";
import { buildFailedValidationResponse } from "../utils/utils";
import prisma from "@/libs/prisma";

enum LowStockThresholdDefault {
    flaskDrink = 24,
    imperialBottle = 12 * 33,
    quartBottle = 12 * 24,
    twelveCase = 12,
    twentyFourCase = 24,
    sixCase = 6,
    default = 5
}

class ConfigService {

    getConfig = async (): Promise<DeepRequired<Config>> => {
        let config = await prisma.config.findFirst();

        if (!config)
            config = await prisma.config.create({
                data: this.generateNewConfig()
            })
        else config = await this.introspectAndUpdateConfig(config)

        return config as DeepRequired<Config>
    }

    updateConfig = async (config: UpdateConfigDto) => {
        const configValidated = UpdateConfigDtoSchema.safeParse(config)
        if (!configValidated.success)
            return buildFailedValidationResponse(configValidated.error)

        const oldConfig = await this.getConfig();
        const { id, createdAt, updatedAt, ...newConfig }: Config = mergeDeepWithArrayReplace(oldConfig, config)
        return await prisma.config.update({
            where: { id },
            // @ts-ignore
            data: newConfig
        })
    }

    setLowStockThreshold = async (type: keyof InventoryConfig['lowStockThresholds'], newThreshold: number) => {
        const config = await this.getConfig();
        config.inventoryConfig.lowStockThresholds[type] = newThreshold;
        await prisma.config.update({
            where: { id: config.id },
            data: config
        })
    }

    private introspectAndUpdateConfig = async (config: Config) => {
        const stagingConfig = { ...config }

        // Update inventory config
        if (!stagingConfig.inventoryConfig) {
            stagingConfig.inventoryConfig = this.generateNewInventoryConfig();
        } else {
            /*
            LOW STOCK THRESHOLDS
            */

            // Compare each key in the schema with the one currently in the object and add the missing ones
            const keys: (keyof InventoryConfig["lowStockThresholds"])[] = [
                "flaskDrink",
                "imperialBottle",
                "quartBottle",
                "twelveCase",
                "twentyFourCase",
                "sixCase",
                "default"
            ];

            for (const key of keys)
                if (stagingConfig.inventoryConfig.lowStockThresholds[key] === undefined)
                    stagingConfig.inventoryConfig.lowStockThresholds[key] = LowStockThresholdDefault[key];
        }

        if (!compare(config, stagingConfig))
            await prisma.config.update({
                where: { id: config.id },
                data: stagingConfig
            })
        return stagingConfig
    }

    private generateNewConfig = (): Omit<Config, "id" | "createdAt" | "updatedAt"> => {
        return ({
            inventoryConfig: this.generateNewInventoryConfig()
        })
    }

    private generateNewInventoryConfig = (): InventoryConfig => {
        return ({
            lowStockThresholds: {
                flaskDrink: LowStockThresholdDefault.flaskDrink,
                imperialBottle: LowStockThresholdDefault.imperialBottle,
                quartBottle: LowStockThresholdDefault.quartBottle,
                twelveCase: LowStockThresholdDefault.twelveCase,
                twentyFourCase: LowStockThresholdDefault.twentyFourCase,
                sixCase: LowStockThresholdDefault.sixCase,
                default: LowStockThresholdDefault.default
            }
        })
    }
}

const configService = new ConfigService();
export default configService;