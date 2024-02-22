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
    }, [reducer]);

    const dispatch = useCallback((payload: P) => {
        setValue(reducerRef.current(passthrough, payload));
    }, [passthrough]);

    const dispatchAsync = useCallback<AsyncMutator<P>>(async (job, payload, options) => {
        const prevVal = value
        setValue(reducerRef.current(passthrough, payload));

        try {
            const result = await job();
            console.log(result)
            if (result !== undefined && (options?.revalidateOnSuccess === undefined || options?.revalidateOnSuccess))
                setValue(reducerRef.current(passthrough, result));
            options?.onSuccess?.(result);
        } catch (e) {
            if (options?.rollbackOnError === undefined || options?.rollbackOnError)
                setValue(prevVal);
            options?.onError?.(e);
        }
    }, [passthrough, value]);

    return [value, dispatch, dispatchAsync] as const;
}