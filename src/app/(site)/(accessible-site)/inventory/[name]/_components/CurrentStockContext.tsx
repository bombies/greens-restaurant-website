"use client";

import React, { Dispatch, SetStateAction } from "react";
import { StockSnapshot } from "@prisma/client";

const CurrentStockContext = React.createContext<[StockSnapshot[], Dispatch<SetStateAction<StockSnapshot[]>>] | undefined>(undefined);

export default function CurrentStockProvider({ children }: React.PropsWithChildren) {
    const currentStockState = React.useState<StockSnapshot[]>([]);

    return (
        <CurrentStockContext.Provider value={currentStockState}>
            {children}
        </CurrentStockContext.Provider>
    );
}

export function useCurrentStock() {
    const context = React.useContext(CurrentStockContext);
    if (!context)
        throw new Error("useCurrentStock must be used within a CurrentStockProvider");
    return context;
}