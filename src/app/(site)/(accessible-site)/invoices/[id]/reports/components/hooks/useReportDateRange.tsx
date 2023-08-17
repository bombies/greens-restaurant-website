"use client"

import { Dispatch, useEffect, useState } from "react";
import { ReportParamsActionType, ReportParamsState } from "./useReport";

export const useReportDateRange = (dispatchReportParams: Dispatch<{
    type: ReportParamsActionType,
    payload: Partial<ReportParamsState>
}>) => {
    const [startDate, setStartDate] = useState<Date>();
    const [endDate, setEndDate] = useState<Date>();

    useEffect(() => {
        dispatchReportParams({
            type: ReportParamsActionType.SET,
            payload: {
                dateFrom: startDate ?? null,
                dateTo: endDate ?? null
            }
        });
    }, [dispatchReportParams, endDate, startDate]);

    return { startDate, endDate, setStartDate, setEndDate };
};