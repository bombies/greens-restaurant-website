import { useCallback, useEffect, useRef, useState, useLayoutEffect } from "react";

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

    return [value, dispatch] as const;
}