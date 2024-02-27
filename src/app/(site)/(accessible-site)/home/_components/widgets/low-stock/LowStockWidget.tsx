import { FC } from "react";
import WidgetContainer from "../WidgetContainer";
import useSWR from "swr";
import { $get } from "@/utils/swr-utils";
import { InventoryWithOptionalExtras } from "@/app/api/inventory/[name]/types";
import LowStockWidgetInventorySection from "./LowStockWidgetInventorySection";
import { Spinner } from "@nextui-org/react";

const FetchInventories = () =>
    useSWR('/api/inventory?with_low_stock=true', $get<InventoryWithOptionalExtras[]>())

const LowStockWidget: FC = () => {
    const { data: inventories, isLoading: inventoriesLoading } = FetchInventories()

    return (
        <WidgetContainer>
            <h3 className="font-black text-lg text-primary capitalize mb-4">
                Low Stock
            </h3>
            <div className="h-full overflow-y-auto">
                {inventoriesLoading ? (
                    <div className="flex justify-center items-center h-full w-full"><Spinner size="lg" /></div>
                ) :
                    inventories?.filter(inventory => inventory.lowStock?.length)?.map(inventory => (
                        <LowStockWidgetInventorySection key={inventory.id} inventory={inventory} />
                    ))
                }
            </div>
        </WidgetContainer>
    )
}

export default LowStockWidget