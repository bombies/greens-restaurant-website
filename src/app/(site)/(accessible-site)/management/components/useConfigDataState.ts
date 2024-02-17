"use client";

import { DataContextState, OptimisticWorker } from "@/utils/context-utils";
import { $get, $patch, handleAxiosError } from "@/utils/swr-utils";
import useSWR from "swr";
import { ConfigDataContext, FullConfig } from "./ConfigProvider";
import { useCallback } from "react";
import useSWRMutation from "swr/mutation";
import { UpdateConfigDto } from "@/app/api/config/types";

const UpdateConfig = () => useSWRMutation("/api/config", $patch<UpdateConfigDto, FullConfig>())

const useConfigDataState = (): ConfigDataContext => {
    const { data, isLoading, mutate } = useSWR("/api/config", $get<FullConfig>())
    const { trigger: triggerUpdate } = UpdateConfig()

    const editOptimisticData = useCallback<OptimisticWorker<FullConfig>>(async (work, optimisticConfig) => {
        if (!data) return

        const doWork = async () => {
            const config = await work()
            if (!config) return data
            return config
        }

        await mutate(doWork, {
            optimisticData: optimisticConfig,
        })
    }, [data, mutate])

    const doEdit = useCallback(
        (dto: UpdateConfigDto, optimisticData: FullConfig) => {
            const work = triggerUpdate({
                body: dto
            }).catch(handleAxiosError)

            editOptimisticData(
                () => work,
                optimisticData
            )
        }, [editOptimisticData, triggerUpdate])

    return {
        loading: isLoading,
        data: data,
        mutateData: mutate,
        optimisticData: {},
        doEdit
    }
}

export default useConfigDataState