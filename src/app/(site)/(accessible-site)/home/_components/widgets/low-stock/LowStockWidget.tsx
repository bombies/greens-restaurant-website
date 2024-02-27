import { FC, useMemo } from "react";
import WidgetContainer from "../WidgetContainer";
import useSWR from "swr";
import { $get } from "@/utils/swr-utils";
import { InventoryWithOptionalExtras } from "@/app/api/inventory/[name]/types";
import LowStockWidgetInventorySection from "./LowStockWidgetInventorySection";
import { Accordion, AccordionItem, Chip, Spinner } from "@nextui-org/react";
import SubTitle from "@/app/_components/text/SubTitle";

const FetchInventories = () =>
    useSWR('/api/inventory?with_low_stock=true&with_stock=false', $get<InventoryWithOptionalExtras[]>())

const LowStockWidget: FC = () => {
    const { data: inventories, isLoading: inventoriesLoading } = FetchInventories()

    const lowStockCounts = useMemo(() => inventories?.reduce((acc, next) => acc + (next.lowStock?.length ?? 0), 0), [inventories])

    const lowStockElements = useMemo(() => inventories?.filter(inventory => inventory.lowStock?.length)
        ?.map(inventory => (
            <AccordionItem
                startContent={(
                    <Chip
                        variant="flat"
                        color="primary"
                        size="sm"
                    >
                        {inventory.lowStock?.length}
                    </Chip>
                )}
                key={inventory.id}
                title={inventory.name.replaceAll("-", " ")}
                classNames={{
                    title: "capitalize"
                }}
            >
                <LowStockWidgetInventorySection inventory={inventory} />
            </AccordionItem>
        )) ?? [], [inventories])

    return (
        <WidgetContainer>
            <h3 className="font-black text-lg text-primary capitalize mb-4">
                Low Stock
            </h3>
            <div className="h-full overflow-y-auto">
                {inventoriesLoading ? (
                    <div className="flex justify-center items-center h-full w-full"><Spinner size="lg" /></div>
                ) :
                    lowStockCounts === 0 ? (
                        <div className="w-full h-full flex justify-center items-center">
                            <SubTitle>There are no low stock...</SubTitle>
                        </div>
                    ) : (
                        <Accordion
                            variant="splitted"
                            itemClasses={{
                                base: "!default-container !p-6 !rounded-2xl",
                                title: "font-bold text-lg"
                            }}
                        >
                            {lowStockElements}
                        </Accordion>
                    )

                }
            </div>
        </WidgetContainer>
    )
}

export default LowStockWidget