"use effect"

import { PaginatedResponse } from "@/app/api/utils/utils";
import { useAsyncList } from "@react-stately/data";
import { useState } from "react";

const useAsyncChunkedItems = <T,>(endpoint: string, limit: number, searchParams?: Record<string, string>) => {
    const [hasMoreToLoad, setHasMoreToLoad] = useState(false);
    const [initialItemsLoading, setInitialItemsLoading] = useState(true);

    let list = useAsyncList<T>({
        async load({ signal, cursor }) {
            const res = await fetch(`${endpoint}?limit=${limit}${cursor ? `&cursor=${cursor}` : ``}${searchParams ? "&" + new URLSearchParams(searchParams).toString() : ''}`, { signal });
            const responseData: PaginatedResponse<T> = await res.json();

            setInitialItemsLoading(false);
            setHasMoreToLoad(!!responseData.nextCursor);

            return {
                items: responseData.data,
                cursor: responseData.nextCursor ?? undefined
            }
        }
    })

    return {
        list,
        initialItemsLoading,
        isLoading: list.isLoading,
        hasMoreToLoad,
    }
}

export default useAsyncChunkedItems