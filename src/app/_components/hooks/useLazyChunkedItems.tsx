"use client"

import { chunk } from "@/utils/GeneralUtils";
import { useAsyncList } from "@react-stately/data";
import { useMemo, useState, useEffect } from "react";

const useLazyChunkedItems = <T,>(items: T[], maxChunkSize?: number) => {
    const chunkedData = useMemo(() => maxChunkSize ? chunk(items, maxChunkSize) : [items], [items, maxChunkSize])
    const [hasMoreToLoad, setHasMoreToLoad] = useState(false);

    let loadedItems = useAsyncList<T>({
        load({ cursor }) {
            if (items.length === 0) return ({ items: [], cursor: undefined })

            const cursorAsNumber = cursor ? parseInt(cursor) : 0;
            setHasMoreToLoad((cursorAsNumber + 1) < chunkedData.length);

            return {
                items: chunkedData[cursorAsNumber],
                cursor: cursorAsNumber < chunkedData.length ? (cursorAsNumber + 1).toString() : undefined
            }
        }
    })

    useEffect(() => {
        loadedItems.reload()
    }, [items])

    return {
        loadedItems,
        hasMoreToLoad
    }
}

export default useLazyChunkedItems