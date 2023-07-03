"use client";

import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

type Props = {
    data: {
        name: string,
        data: number[] | { x: number, y: number }[]
    }[],
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
        dataLabels: { enabled: false },
        legend: {
            position: "bottom"
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
        states: {
            hover: {
                filter: {
                    type: "none"
                }
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
        grid: {
            borderColor: "rgba(255, 255, 255, 0.08)",
            padding: {
                left: -10,
                right: 0,
                top: -16,
                bottom: -8
            },
            xaxis: { lines: { show: false } },
            yaxis: { lines: { show: false } }
        },
        yaxis: { labels: { show: showY || false } },
        xaxis: {
            labels: { show: showCategories || false },
            axisBorder: { show: false },
            axisTicks: { show: false },
            crosshairs: { show: false },
            categories: categories
        },
        ...apexOptions
    };

    return (
        <Chart
            options={options}
            series={data}
            xaxis={{
                type: dateTime ? "datetime" : "category"
            }}
            type={type || "area"}
            width={width || "100%"}
            height={height || "100%"}
            foreColor="#000000"
            background="#000000"
        />
    );
}