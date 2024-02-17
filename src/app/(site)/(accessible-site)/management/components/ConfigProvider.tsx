"use client"

import { DataContextState, createDataContext } from "@/utils/context-utils";
import { Config } from "@prisma/client";
import { FC, PropsWithChildren } from "react";
import { DeepRequired } from "react-hook-form";
import useConfigDataState from "./useConfigDataState";
import { UpdateConfigDto } from "@/app/api/config/types";

export type FullConfig = DeepRequired<Config>

export type ConfigDataContext = DataContextState<FullConfig> & {
    doEdit: (dto: UpdateConfigDto, optimisticData: FullConfig) => void
}

const [ConfigContext, hook] = createDataContext<ConfigDataContext>("useConfig must be used within a ConfigProvider");

const ConfigProvider: FC<PropsWithChildren> = ({ children }) => {
    const configDataState = useConfigDataState()

    return (
        <ConfigContext.Provider value={configDataState}>
            {children}
        </ConfigContext.Provider>
    )
}

export default ConfigProvider
export { hook as useConfig }