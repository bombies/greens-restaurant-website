"use client";

import React, { Dispatch, FC, useEffect, useState } from "react";
import { Spacer } from "@nextui-org/react";
import { GoBackButton } from "../../../components/control-bar/InvoiceCustomerControlBar";
import { ReportParamsActionType, ReportParamsState } from "../InvoiceReportsContext";
import { ChangeInvoiceReportStatusButton } from "./ChangeInvoiceReportStatusButton";
import { GenericDatePicker } from "../../../../../../../_components/GenericDatePicker";
import { Divider } from "@nextui-org/divider";

interface Props {
    id: string,
    reportParams: ReportParamsState,
    dispatchReportParams: Dispatch<{ type: ReportParamsActionType, payload: Partial<ReportParamsState> }>
}

export const InvoiceReportsControlBar: FC<Props> = ({ id, reportParams, dispatchReportParams }) => {
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

    return (
        <div className="default-container p-12">
            <GoBackButton href={`/invoices/${id}`} label="View All Invoices" />
            <Divider className="my-6" />
            <div className="grid place-content-center grid-cols-3 tablet:grid-cols-1 gap-4">
                <GenericDatePicker
                    id="start_date"
                    label="Start Date"
                    labelPlacement="above"
                    date={startDate}
                    onDateChange={setStartDate}
                    max={endDate}
                />
                <GenericDatePicker
                    id="end_date"
                    label="End Date"
                    labelPlacement="above"
                    date={endDate}
                    onDateChange={setEndDate}
                    min={startDate}
                />
                <ChangeInvoiceReportStatusButton dispatchReportParams={dispatchReportParams} />
            </div>
        </div>
    );
};