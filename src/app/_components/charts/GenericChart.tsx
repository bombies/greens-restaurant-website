"use client";

import ReactApexChart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

type Props = {
    data: {
        name: string,
        data: number[] | { x: number, y: number }[]
    }[] | number[],
    categories?: string[]
    dateTime?: boolean,
    showCategories?: boolean,
    width?: string | number,
    height?: string | number,
    showY?: boolean,
    type?: "line"
        | "area"
        | "bar"
        | "histogram"
        | "pie"
        | "donut"
        | "radialBar"
        | "scatter"
        | "bubble"
        | "heatmap"
        | "treemap"
        | "boxPlot"
        | "candlestick"
        | "radar"
        | "polarArea"
        | "rangeBar",
} & ApexOptions;

export default function GenericChart({
                                         data,
                                         dateTime,
                                         categories,
                                         type,
                                         width,
                                         height,
                                         showCategories,
                                         showY,
                                         ...apexOptions
                                     }: Props) {
    const options: ApexOptions = {
        chart: {
            toolbar: {
                show: true,
                tools: {
                    download: false,
                    zoomout: false,
                    zoomin: false,
                    pan: false
                }
            },
            animations: {
                speed: 750,
                dynamicAnimation: {
                    enabled: true,
                    speed: 350
                }
            }
        },
        dataLabels: {
            enabled: false,
        },
        fill: {
            type: "gradient",
            gradient: {
                shade: "light",
                type: "vertical",
                opacityFrom: 0.4,
                opacityTo: 0.1,
                shadeIntensity: 0.2
            }
        },
        colors: [
            "#00D615",
            "#039108",
            "#24ff95",
            "#00d047",
            "#50b54e",
            "#c3ffc2",
            "#012b00",
            "#c2a500",
            "#c2a500",
            "#ffe869",
            "#f08c00",
            "#f08c00"
        ],
        ...apexOptions
    };

    return (
        <ReactApexChart
            options={options}
            series={data}
            type={type || "area"}
            width={width || "100%"}
            height={height || "100%"}
            foreColor="#000000"
        />
    );
}