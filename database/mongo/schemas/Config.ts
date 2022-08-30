import mongoose from "mongoose";

export interface IConfig {
    stockWarningMinimum: number
}

const ConfigSchema = new mongoose.Schema<IConfig>({
    stockWarningMinimum: { type: Number, required: true }
});

export default ConfigSchema;
export const Config = mongoose.models.config || mongoose.model('config', ConfigSchema, 'config');