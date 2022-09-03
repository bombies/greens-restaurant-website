import mongoose from "mongoose";

export interface IConfig {
    inventory: {
        stockWarningMinimum: number;
    };
    employees: {
        jobPositions: string[];
    };
}

const ConfigSchema = new mongoose.Schema<IConfig>({
    employees: {
        type: Object,
        required: true,
    },
    inventory: { type: Object, required: true },
});

export default ConfigSchema;
export const Config =
    mongoose.models.config || mongoose.model("config", ConfigSchema, "config");