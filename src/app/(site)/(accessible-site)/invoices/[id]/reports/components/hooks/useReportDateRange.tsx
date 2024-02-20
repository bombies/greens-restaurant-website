"use client"

import { Dispatch, useEffect, useState } from "react";
import { ReportParamsActionType, ReportParamsState } from "./useInvoiceReport";

export const useReportDateRange = (dispatchReportParams: Dispatch<{
    type: ReportParamsActionType,
    payload: Partial<ReportParamsState>
}>) => {
    const [startDate, setStartDate] = useState<Date>();
    const [endDate, setEndDate] = useState<Date>();

    useEffect(() => {
        let sd = startDate;
        let ed = endDate;

        if (sd) {
            sd = new Date(sd);
            sd.setHours(0, 0, 0, 0);
        }

        if (ed) {
            ed = new Date(ed);
            ed.setHours(23, 59, 59, 999);
        }

        dispatchReportParams({
            type: ReportParamsActionType.SET,
            payload: {
                dateFrom: sd,
                dateTo: ed
            }
        });
    }, [dispatchReportParams, endDate, startDate]);

    return { startDate, endDate, setStartDate, setEndDate };
};