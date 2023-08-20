"use client";

import { AppDispatch, AppState } from "./redux/GlobalStore";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { toast, ToastOptions } from "react-hot-toast";
import ToastComponent, { ToastDataProps } from "../app/_components/ToastComponent";
import React, {
    MutableRefObject,
    SetStateAction,
    useCallback,
    useEffect,
    useRef,
    useState
} from "react";
import { AxiosError } from "axios";
import { User } from "@prisma/client";
import useSWR from "swr";
import { fetcher } from "../app/(site)/(accessible-site)/employees/_components/EmployeeGrid";
import Permission, { hasAnyPermission } from "../libs/types/permission";
import { useRouter } from "next/navigation";

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<AppState> = useSelector;

export function useVisible(ref: MutableRefObject<any>): boolean {
    const [isVisible, setVisible] = useState(true);

    useEffect(() => {
        const curRef = ref.current;

        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => setVisible(entry.isIntersecting));
        });

        if (curRef) observer.observe(curRef);
        return () => {
            if (curRef) observer.unobserve(curRef);
        };
    }, [ref]);

    return isVisible;
}

type UserData = {
    isLoading: boolean,
    error: any,
    data?: User
}

const FetchUserData = () => {
    return useSWR("/api/users/me", fetcher<User>);
};

export function useUserData(permissions?: Permission[]): UserData {
    const { data, isLoading, error } = FetchUserData();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && permissions &&
            (!data || !hasAnyPermission(data.permissions, permissions))
        )
            router.replace("/home");
    }, [data, isLoading, permissions, router]);

    return { data, isLoading, error };
}

export function errorToast(error: AxiosError, fallback?: string, options?: ToastOptions) {
    // @ts-ignore
    toast.error(error.response?.data?.message || (fallback ?? "An error occurred!"), options);
}

type Callback<T> = (value?: T) => void;
type DispatchWithCallback<T> = (value: T, callback?: Callback<T>) => void;

function useStateCallback<T>(initialState: T | (() => T)): [T, DispatchWithCallback<SetStateAction<T>>] {
    const [state, _setState] = useState(initialState);

    const callbackRef = useRef<Callback<T>>();
    const isFirstCallbackCall = useRef<boolean>(true);

    const setState = useCallback((setStateAction: SetStateAction<T>, callback?: Callback<T>): void => {
        callbackRef.current = callback;
        _setState(setStateAction);
    }, []);

    useEffect(() => {
        if (isFirstCallbackCall.current) {
            isFirstCallbackCall.current = false;
            return;
        }
        callbackRef.current?.(state);
    }, [state]);

    return [state, setState];
}