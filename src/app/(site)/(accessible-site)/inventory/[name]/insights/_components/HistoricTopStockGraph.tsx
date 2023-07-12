"use client";

import { StockTimeSeries } from "../../../../../../api/inventory/[name]/insights/stock/route";
import { Spacer } from "@nextui-org/react";
import { Spinner } from "@nextui-org/spinner";
import GenericChart from "../../../../../../_components/charts/GenericChart";
import "../../../../../../../utils/GeneralUtils";
import { useEffect, useState } from "react";
import DropdownInput from "../../../../../../_components/inputs/DropdownInput";

type Props = {
    data?: StockTimeSeries[],
    isLoading: boolean,
}

enum TopMax {
    THREE = 3,
    FIVE = 5,
    TEN = 10,
    FIFTEEN = 15,
    TWENTY = 20,
}


export default function HistoricTopStockGraph({ data, isLoading }: Props) {
    const [topMax, setTopMax] = useState<TopMax>(TopMax.THREE);
    const [selectedTopMax, setSelectedTopMax] = useState("Top 3");

    const totals = data?.map(item => ({
        name: item.name.replaceAll("-", " ").capitalize(),
        data: item.data.map(info => info.value).reduce((acc, next) => acc + next)
    }))
        .sort((a, b) => b.data - a.data)
        .slice(0, topMax);

    useEffect(() => {
        switch (selectedTopMax) {
            case "top_3": {
                setTopMax(TopMax.THREE);
                break;
            }
            case "top_5": {
                setTopMax(TopMax.FIVE);
                break;
            }
            case "top_10": {
                setTopMax(TopMax.TEN);
                break;
            }
            case "top_15": {
                setTopMax(TopMax.FIFTEEN);
                break;
            }
            case "top_20": {
                setTopMax(TopMax.TWENTY);
                break;
            }
        }
    }, [selectedTopMax]);

    return (
        <div
            className="bg-neutral-950/70 backdrop-blur-md text-primary pt-6 px-6 pb-12 h-[30rem] phone:h-fit rounded-2xl h-96">
            <div className="flex gap-6">
                <h3 className="font-black text-2xl self-center">Top Stock</h3>
                <DropdownInput
                    keys={["Top 3", "Top 5", "Top 10", "Top 15", "Top 20"]}
                    variant="flat"
                    selectionRequired
                    selectedKeys={[selectedTopMax]}
                    selectedValueLabel
                    setSelectedKeys={(keys) => {
                        setSelectedTopMax((Array.from(keys) as string[])[0]);
                    }}
                />
            </div>
            <Spacer y={2} />
            {
                isLoading ?
                    <div className="flex justify-center items-center h-full w-full">
                        <Spinner size="lg" />
                    </div>
                    :
                    <GenericChart
                        data={totals!.map(data => data.data)}
                        labels={totals!.map(data => data.name)}
                        type="pie"
                        fill={{
                            type: "gradient",
                            gradient: {
                                shade: "light",
                                type: "vertical",
                                opacityFrom: 0.4,
                                opacityTo: 0.9,
                                shadeIntensity: 0.2
                            }
                        }}
                        dataLabels={{
                            enabled: false
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