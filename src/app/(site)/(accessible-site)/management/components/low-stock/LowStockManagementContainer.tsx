"use client"

import { FC } from "react";
import { useConfig } from "../ConfigProvider";
import { InventoryConfig } from "@prisma/client";
import { LowStockThreshold } from "../../../inventory/utils/inventory-utils";
import EditableLowStockThreshold from "./EditableLowStockThreshold";

const LowStockManagementContainer: FC = () => {
    const { data: config, doEdit } = useConfig()

    return (
        <div className="grid grid-cols-3 gap-4">
            {Object.keys(LowStockThreshold).map((threshold) => (
                <EditableLowStockThreshold
                    key={threshold}
                    config={config}
                    threshold={threshold as keyof InventoryConfig['lowStockThresholds']}
                    doEdit={doEdit}
                />
            ))}
        </div>

    )
}

export default LowStockManagementContainer