"use effect"

import { PaginatedResponse } from "@/app/api/utils/utils";
import { useAsyncList } from "@react-stately/data";
import { useCallback, useEffect, useMemo, useState } from "react";

const useAsyncChunkedItems = <T,>(endpoint: string, limit: number, searchParams?: Record<string, string | undefined>) => {
    const [currentParams, setCurrentParams] = useState<Record<string, string | undefined>>(searchParams ?? {});
    const [hasMoreToLoad, setHasMoreToLoad] = useState(false);
    const [initialItemsLoading, setInitialItemsLoading] = useState(true);
    const [paramsUpdated, setParamsUpdated] = useState(false);

    const filteredSearchParams = useMemo(() => {
        const filtered: Record<string, string> = {}
        if (currentParams)
            for (const key in currentParams)
                if (currentParams[key] !== undefined)
                    filtered[key] = currentParams[key] as string;
        return filtered
    }, [currentParams]);


    let list = useAsyncList<T>({
        async load({ signal, cursor }) {
            const res = await fetch(`${endpoint}?limit=${limit}${cursor ? `&cursor=${cursor}` : ``}${Object.keys(filteredSearchParams).length ? "&" + new URLSearchParams(filteredSearchParams).toString() : ''}`, { signal });
            const responseData: PaginatedResponse<T> = await res.json();

            setInitialItemsLoading(false);
            setParamsUpdated(false);
            setHasMoreToLoad(!!responseData.nextCursor);

            return {
                items: responseData.data,
                cursor: responseData.nextCursor ?? undefined
            }
        }
    })

    const reloadWithParams = useCallback((newParams: Record<string, string | undefined>) => {
        setCurrentParams({
            ...currentParams,
            ...newParams,
        })
        setParamsUpdated(true);
    }, [currentParams])

    useEffect(() => {
        if (paramsUpdated)
            list.reload()
    }, [paramsUpdated])

    return {
        list,
        initialItemsLoading,
        isLoading: list.isLoading,
        hasMoreToLoad,
        reloadWithParams
    }
}

export default useAsyncChunkedItems