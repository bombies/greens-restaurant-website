"use client";

import GenericChart from "../../../../../../_components/charts/GenericChart";
import useSWR from "swr";
import { fetcher } from "../../../../employees/_components/EmployeeGrid";
import { StockTimeSeries } from "../../../../../../api/inventory/[name]/insights/stock/route";
import { Spinner } from "@nextui-org/spinner";
import { Spacer } from "@nextui-org/react";

type Props = {
    inventoryName: string,
}

const FetchInsights = (inventoryName: string) => {
    return useSWR(`/api/inventory/${inventoryName}/insights/stock`, fetcher<StockTimeSeries[]>);
};

export default function InventoryStockGraph({ inventoryName }: Props) {
    const { data, isLoading, error } = FetchInsights(inventoryName);

    return (
        <div className="bg-neutral-200 text-black backdrop-blur-md pt-6 px-2 pb-12 rounded-2xl h-96">
            <h3 className="font-black text-2xl">Stock Quantity</h3>
            <Spacer y={2} />
            {
                isLoading ?
                    <div className="flex justify-center items-center h-full w-full">
                        <Spinner size="xl" />
                    </div>
                    :
                    <GenericChart
                        showY
                        showCategories
                        dateTime
                        data={
                            data!.map(series => ({
                                name: series.name,
                                data: series.data.map(seriesData => ({
                                    x: new Date(seriesData.date).getTime(),
                                    y: seriesData.value
                                }))
                            }))
                        }
                    />
            }

        </div>

    );
}