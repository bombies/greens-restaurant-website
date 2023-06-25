"use client";

import AddStockItemButton from "./AddStockItemButton";
import { Dispatch, SetStateAction } from "react";
import { StockSnapshot } from "@prisma/client";

type Props = {
    inventoryName: string,
    setCurrentData: Dispatch<SetStateAction<StockSnapshot[]>>
}

export default function SpecificInventoryControlBar({ inventoryName, setCurrentData }: Props) {
    return (
        <div className="default-container p-12 phone:px-4 flex phone:flex-col gap-4 phone:gap-2">
            <AddStockItemButton inventoryName={inventoryName} setCurrentData={setCurrentData} />
        </div>
    );
}