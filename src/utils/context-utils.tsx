"use client"

import { Context, createContext, Dispatch, SetStateAction, useContext } from "react";

export function createGenericContext<T>(hookErr?: string): [Context<T | undefined>, () => T] {
    const context = createContext<T | undefined>(undefined);
    const useHook = () => useGenericContextHook(context, hookErr);
    return [context, useHook];
}

export function useGenericContextHook<T>(context: Context<T | undefined>, hookErr?: string): T {
    const data = useContext(context);
    if (!data)
        throw new Error(hookErr ?? "This hook cannot be used here!");
    return data;
}

export type UseStateArray<T> = [T, Dispatch<SetStateAction<T>>]
export type UseReducerArray<T, A> = [T, Dispatch<A>]