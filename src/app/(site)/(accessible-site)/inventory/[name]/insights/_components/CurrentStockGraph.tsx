"use client";

import { StockTimeSeries } from "../../../../../../api/inventory/[name]/insights/stock/route";
import { Spacer } from "@nextui-org/react";
import { Spinner } from "@nextui-org/spinner";
import GenericChart from "../../../../../../_components/charts/GenericChart";
import "../../../../../../../utils/GeneralUtils"

type Props = {
    data?: StockTimeSeries[],
    isLoading: boolean,
}

export default function CurrentStockGraph({ data, isLoading }: Props) {
    const mostRecentData = data?.map(series => ({
        name: series.name.capitalize(),
        data: series.data.reduce((acc, next) => acc.date > next.date ? acc : next)
    }));

    return (
        <div className="bg-neutral-950/70 backdrop-blur-md h-[30rem] phone:h-fit text-primary rounded-2xl p-6">
            <h3 className="font-black text-2xl">Current Stock</h3>
            <Spacer y={2} />
            {
                isLoading ?
                    <div className="flex justify-center items-center h-full w-full">
                        <Spinner size="lg" />
                    </div>
                    :
                    <GenericChart
                        data={mostRecentData!.map(data => data.data.value)}
                        labels={mostRecentData!.map(data => data.name)}
                        type="donut"
                        plotOptions={{
                            pie: {
                                donut: {
                                    size: "65%",
                                    labels: {
                                        show: true,
                                        value: {
                                            color: "#ffffff"
                                        }
                                    }
                                }
                            }
                        }}
                        fill={{
                            type: undefined
                        }}
                        dataLabels={{
                            enabled: false,
                        }}
                        legend={{
                            labels: {
                                colors: '#ffffff'
                            }
                        }}
                    />
            }
        </div>
    );
}