"use client";

import React, { Dispatch, SetStateAction } from "react";
import { StockSnapshot } from "@prisma/client";
import { StockSnapshotWithStock } from "../../../../../api/inventory/[name]/utils";

const CurrentStockContext = React.createContext<[StockSnapshotWithStock[], Dispatch<SetStateAction<StockSnapshotWithStock[]>>] | undefined>(undefined);

export default function CurrentStockProvider({ children }: React.PropsWithChildren) {
    const currentStockState = React.useState<StockSnapshotWithStock[]>([]);

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