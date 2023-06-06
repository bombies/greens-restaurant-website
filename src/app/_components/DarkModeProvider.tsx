"use client";

import React, { useEffect, useState } from "react";
import { useTheme as useNextTheme } from "next-themes";
import { selectDarkModeState, setDarkMode } from "../../utils/redux/slices/DarkModeSlice";
import { useAppDispatch, useAppSelector } from "../../utils/Hooks";

const DarkModeContext = React.createContext<[boolean, React.Dispatch<React.SetStateAction<boolean>>] | undefined>(undefined);

export function DarkModeProvider({
                                     children
                                 }: {
    children: React.ReactNode
}) {
    const dispatch = useAppDispatch();
    const { setTheme } = useNextTheme();
    const initialDarkModeState = useAppSelector(selectDarkModeState);
    const [darkMode, setDarkModeState] = useState<boolean>(initialDarkModeState);

    useEffect(() => {
        dispatch(setDarkMode(darkMode));
        setTheme(darkMode ? "dark" : "light");
    }, [darkMode, dispatch, setTheme]);

    return (
        <DarkModeContext.Provider value={[darkMode, setDarkModeState]}>
            <div className={`${darkMode ? "dark !bg-dark" : "!bg-neutral-50"}`}>
                {children}
            </div>
        </DarkModeContext.Provider>
    );
}

export function useDarkMode() {
    const context = React.useContext(DarkModeContext);
    if (!context)
        throw new Error("useDarkMode must be used within a DarkModeProvider");
    return context;
}