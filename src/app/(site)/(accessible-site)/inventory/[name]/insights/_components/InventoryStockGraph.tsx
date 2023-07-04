"use client";

import GenericChart from "../../../../../../_components/charts/GenericChart";
import useSWR from "swr";
import { fetcher } from "../../../../employees/_components/EmployeeGrid";
import { StockTimeSeries } from "../../../../../../api/inventory/[name]/insights/stock/route";
import { Spinner } from "@nextui-org/spinner";
import { Spacer } from "@nextui-org/react";
import "../../../../../../../utils/GeneralUtils";


type Props = {
    data?: StockTimeSeries[],
    isLoading: boolean,
}

const FetchInsights = (inventoryName: string) => {
    return useSWR(`/api/inventory/${inventoryName}/insights/stock`, fetcher<StockTimeSeries[]>);
};

export default function InventoryStockGraph({ data, isLoading }: Props) {

    return (
        <div className="bg-neutral-950/70 backdrop-blur-md text-primary pt-6 px-6 pb-12 rounded-2xl h-[30rem]">
            <h3 className="font-black text-2xl">Stock Quantity</h3>
            <Spacer y={2} />
            {
                isLoading ?
                    <div className="flex justify-center items-center h-full w-full">
                        <Spinner size="lg" />
                    </div>
                    :
                    <GenericChart
                        showY
                        showCategories
                        dateTime
                        data={
                            data!.map(series => ({
                                name: series.name.capitalize(),
                                data: series.data.map(seriesData => ({
                                    x: new Date(seriesData.date).getTime(),
                                    y: seriesData.value
                                }))
                            }))
                        }
                        xaxis={{
                            labels: {
                                style: {
                                    colors: "#ffffff"
                                },
                                datetimeUTC: true
                            },
                            type: "datetime"
                        }}
                        yaxis={{
                            labels: {
                                style: {
                                    colors: "#ffffff"
                                }
                            }
                        }}
                        grid={{
                            show: true,
                            borderColor: "#000000"
                        }}
                        legend={{
                            labels: {
                                colors: "#ffffff"
                            }
                        }}
                    />
            }

        </div>

    );
}