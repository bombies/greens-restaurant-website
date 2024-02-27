"use client";

import useSWR from "swr";
import { fetcher } from "../../../employees/_components/EmployeeGrid";
import { Inventory } from "@prisma/client";
import { StockTimeSeries } from "../../../../../api/inventory/[name]/insights/stock/route";
import { Fragment, useMemo, useState } from "react";
import { Pagination, Spacer, Spinner } from "@nextui-org/react";
import GenericChart from "../../../../../_components/charts/GenericChart";
import SubTitle from "../../../../../_components/text/SubTitle";
import WidgetContainer from "./WidgetContainer";

const FetchInventories = () => {
    return useSWR("/api/inventory", fetcher<Inventory[]>);
};

export default function StockGraphWidget() {
    const { data: inventories, isLoading: inventoriesLoading } = FetchInventories();
    const [currentPage, setCurrentPage] = useState(1);
    const {
        data: inventoryInsights,
        isLoading: inventoryInsightsLoading
    } = useSWR(inventories?.length ? `/api/inventory/${inventories[currentPage - 1].name}/insights/stock` : null, fetcher<StockTimeSeries[]>);

    const mostRecentData = useMemo(() => inventoryInsights?.map(series => ({
        name: series.name.replaceAll("-", " "),
        data: series.data.reduce((acc, next) => acc.date > next.date ? acc : next)
    })), [inventoryInsights]);

    return (
        <WidgetContainer>
            {
                inventoriesLoading ?
                    <div className="flex justify-center items-center w-full h-full"><Spinner size="lg" /></div>
                    :
                    (!inventories?.length ?
                        <div className="h-full">
                            <h3 className="font-black text-lg capitalize px-3 text-primary">
                                Current Stock
                            </h3>
                            <Spacer y={6} />
                            <div className="flex justify-center h-full items-center">
                                <SubTitle>No Data...</SubTitle>
                            </div>
                        </div>
                        :
                        <div className="h-full">
                            <h3 className="font-black text-lg capitalize px-3 text-primary">
                                Current Stock
                                - {inventories[currentPage - 1].name.replaceAll("-", " ")}
                            </h3>
                            <Spacer y={4} />
                            {
                                inventoryInsightsLoading ?
                                    <div className="flex justify-center items-center h-full w-full">
                                        <Spinner size="lg" />
                                    </div>
                                    :
                                    <Fragment>
                                        {
                                            mostRecentData?.length ?
                                                <div className="h-3/4">
                                                    <GenericChart
                                                        data={mostRecentData.map(data => data.data.value)}
                                                        labels={mostRecentData.map(data => data.name)}
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
                                                            enabled: false
                                                        }}
                                                        legend={{
                                                            show: false
                                                        }}
                                                    />
                                                </div>
                                                :
                                                <div className="default-container p-6 my-6">
                                                    <SubTitle>No Data...</SubTitle>
                                                </div>
                                        }
                                        {
                                            (inventories.length > 1)
                                            &&
                                            <div className="flex justify-center">
                                                <Pagination
                                                    variant="bordered"
                                                    showShadow
                                                    showControls
                                                    total={inventories.length}
                                                    page={currentPage}
                                                    onChange={setCurrentPage}
                                                />
                                            </div>
                                        }
                                    </Fragment>
                            }
                        </div>
                    )
            }
        </WidgetContainer>
    );
}