"use client"

import { UpdateConfigDto } from "@/app/api/config/types"
import { InventoryConfig } from "@prisma/client"
import { FC, useMemo, useState } from "react"
import EditableField, { DataContainer } from "../../../employees/[username]/_components/EditableField"
import { LowStockThreshold } from "../../../inventory/utils/inventory-utils"
import { FullConfig } from "../ConfigProvider"
import EditLowStockThresholdModal from "./EditLowStockThresholdModal"

type EditableLowStockThresholdProps = {
    config?: FullConfig
    threshold: keyof InventoryConfig['lowStockThresholds']
    doEdit: (dto: UpdateConfigDto, optimisticData: FullConfig) => void
}

const EditableLowStockThreshold: FC<EditableLowStockThresholdProps> = ({ config, threshold, doEdit }) => {
    const [modalOpen, setModalOpen] = useState(false)
    const stockType = useMemo(() => LowStockThreshold[threshold], [threshold])

    return (
        <>
            <DataContainer
                editAllowed
                label={stockType.toString().replaceAll("_", " ").toLowerCase()}
                field={config?.inventoryConfig.lowStockThresholds[threshold].toString()}
                onEdit={() => {
                    setModalOpen(true)
                }}
            />
            <EditLowStockThresholdModal
                stockType={stockType}
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onEdit={(newThreshold) => {
                    if (!config)
                        return

                    doEdit({
                        id: config.id,
                        inventoryConfig: {
                            lowStockThresholds: {
                                [threshold]: newThreshold
                            }
                        }
                    }, {
                        ...config,
                        inventoryConfig: {
                            ...config?.inventoryConfig,
                            lowStockThresholds: {
                                ...config?.inventoryConfig.lowStockThresholds,
                                [threshold]: newThreshold
                            }
                        }
                    })
                    setModalOpen(false)
                }}
                defaultValue={config?.inventoryConfig.lowStockThresholds[threshold] ?? 0}
            />
        </>

    )
}

export default EditableLowStockThreshold