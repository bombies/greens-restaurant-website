"use client";

import { AppDispatch, AppState } from "./redux/GlobalStore";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { toast, ToastOptions } from "react-hot-toast";
import ToastComponent, { ToastDataProps } from "../app/_components/ToastComponent";
import { MutableRefObject, useEffect, useState } from "react";

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

export function sendToast(props: ToastDataProps, options?: ToastOptions) {
    toast.custom(t => (<ToastComponent toastObj={t} data={props} />), options);
}