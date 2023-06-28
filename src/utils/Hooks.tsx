"use client";

import { AppDispatch, AppState } from "./redux/GlobalStore";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { toast, ToastOptions } from "react-hot-toast";
import ToastComponent, { ToastDataProps } from "../app/_components/ToastComponent";
import React, { MutableRefObject, SetStateAction, useCallback, useEffect, useRef, useState } from "react";
import axios, { AxiosError } from "axios";
import { useSession } from "next-auth/react";
import { User } from "@prisma/client";
import useSWR from "swr";
import { fetcher } from "../app/(site)/(accessible-site)/employees/_components/EmployeeGrid";

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

export function useUserData(): UserData {
    const { data, isLoading, error } = FetchUserData();
    return { data, isLoading, error };
}

export function sendToast(props: ToastDataProps & { error?: AxiosError }, options?: ToastOptions) {
    if (props.error) {
        // @ts-ignore
        props.description = props.error.response?.data?.message || (props.description || "An error occurred!");
    }

    toast.custom(t => (<ToastComponent toastObj={t} data={props} />), options);
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