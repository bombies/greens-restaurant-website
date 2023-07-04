"use client";

import InventoryStockGraph from "./InventoryStockGraph";
import useSWR from "swr";
import { fetcher } from "../../../../employees/_components/EmployeeGrid";
import { StockTimeSeries } from "../../../../../../api/inventory/[name]/insights/stock/route";
import CurrentStockGraph from "./CurrentStockGraph";
import HistoricTopStockGraph from "./HistoricTopStockGraph";

type Props = {
    inventoryName: string,
}

const FetchInsights = (inventoryName: string) => {
    return useSWR(`/api/inventory/${inventoryName}/insights/stock`, fetcher<StockTimeSeries[]>);
};

export default function InventoryInsightsContainer({ inventoryName }: Props) {
    const { data, isLoading, error } = FetchInsights(inventoryName);

    return (
        <div className="default-container p-12 phone:py-12 phone:px-4 grid grid-cols-1 gap-6">
            <InventoryStockGraph data={data} isLoading={isLoading} />
            <div className="grid grid-cols-2 tablet:grid-cols-1 gap-6">
                <CurrentStockGraph data={data} isLoading={isLoading} />
                <HistoricTopStockGraph isLoading={isLoading} data={data} />
            </div>
        </div>
    );
}