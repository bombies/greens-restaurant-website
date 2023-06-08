import { IConfig } from "../../database/mongo/schemas/Config";
import { NextResponse } from "next/server";

export const respond = (options: {
    data?: any,
    message?: string,
    init?: ResponseInit
}) => {
    return NextResponse.json(options.data || {
        message: options.message
    }, options.init);
};

export const generateDefaultConfig = (): IConfig => {
    return {
        inventory: {
            stockWarningMinimum: 10
        },
        employees: {
            jobPositions: []
        }
    };
};

type ParamSearchObject = {
    searchParams: URLSearchParams,
    paramName: string,
    limit?: number,
    defaultResult?: string
}

export const getParamFromSearch = (options: ParamSearchObject): string => {
    const { searchParams, paramName, limit, defaultResult } = options;
    const result = searchParams.get(paramName);
    return result?.slice(0, limit ?? result.length) ?? (defaultResult ?? "");
};