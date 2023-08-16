"use client";

import React, { Dispatch, FC, useEffect, useState } from "react";
import { Spacer } from "@nextui-org/react";
import { GoBackButton } from "../../../components/control-bar/InvoiceCustomerControlBar";
import { ReportParamsActionType, ReportParamsState } from "../InvoiceReportsContext";
import { ChangeInvoiceReportStatusButton } from "./ChangeInvoiceReportStatusButton";

interface Props {
    id: string,
    reportParams: ReportParamsState,
    dispatchReportParams: Dispatch<{ type: ReportParamsActionType, payload: Partial<ReportParamsState> }>
}

export const InvoiceReportsControlBar: FC<Props> = ({ id, reportParams, dispatchReportParams }) => {

    return (
        <div className="default-container p-12">
            <GoBackButton href={`/invoices/${id}`} label="View All Invoices" />
            <Spacer y={6} />
            <div className="grid grid-cols-4 tablet:grid-cols-1 gap-4">
                <ChangeInvoiceReportStatusButton dispatchReportParams={dispatchReportParams} />
            </div>
        </div>
    );
};