"use client"

import { useCallback, useEffect, useRef, useState, useLayoutEffect } from "react";

export type AsyncMutator<T> = (
    job: () => Promise<T | undefined>,
    payload: T,
    options?: {
        revalidateOnSuccess?: boolean,
        rollbackOnError?: boolean,
        onSuccess?: (result: T | undefined) => void,
        onError?: (error: any) => void,
    }) => void;

export type OptimisticMutator<T> = (payload: T) => void;

export default function useOptimistic<T, P>(passthrough: T, reducer: (state: T, payload: P) => T) {
    const [value, setValue] = useState(passthrough);

    useEffect(() => {
      setValue(passthrough);
    }, [passthrough]);
  
    const reducerRef = useRef(reducer);
    useLayoutEffect(() => {
      reducerRef.current = reducer;
    }, []);
  
    const dispatch = useCallback((payload: P) => {
      setValue(reducerRef.current(value, payload));
    }, [value]);
  
    return [value, dispatch] as const;
}