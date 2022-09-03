import { IConfig } from "../../database/mongo/schemas/Config";

export const generateDefaultConfig = (): IConfig => {
    return {
        inventory: {
            stockWarningMinimum: 10,
        },
        employees: {
            jobPositions: [],
        },
    };
};