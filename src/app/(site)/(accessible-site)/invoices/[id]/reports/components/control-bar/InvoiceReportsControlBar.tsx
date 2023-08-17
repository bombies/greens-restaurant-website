"use client";

import React, { Dispatch, FC, useEffect, useState } from "react";
import { Accordion, AccordionItem, Spacer } from "@nextui-org/react";
import { GoBackButton } from "../../../components/control-bar/InvoiceCustomerControlBar";
import { ReportParamsActionType, ReportParamsState } from "../InvoiceReportsContext";
import { ChangeInvoiceReportStatusButton } from "./ChangeInvoiceReportStatusButton";
import { GenericDatePicker } from "../../../../../../../_components/GenericDatePicker";
import { Divider } from "@nextui-org/divider";
import SubTitle from "../../../../../../../_components/text/SubTitle";
import GenericButton from "../../../../../../../_components/inputs/GenericButton";
import SpreadsheetIcon from "../../../../../../../_components/icons/SpreadsheetIcon";
import PDFIcon from "../../../../../../../_components/icons/PDFIcon";

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
            <SubTitle>Filter Invoices</SubTitle>
            <Spacer y={6} />
            <div className="grid place-content-center grid-cols-3 default-container p-6 tablet:grid-cols-1 gap-4">
                <GenericDatePicker
                    id="start_date"
                    label="Start Date"
                    labelPlacement="above"
                    onDateChange={setStartDate}
                    max={endDate}
                />
                <GenericDatePicker
                    id="end_date"
                    label="End Date"
                    labelPlacement="above"
                    onDateChange={setEndDate}
                    min={startDate}
                />
                <ChangeInvoiceReportStatusButton dispatchReportParams={dispatchReportParams} />
            </div>
            <Spacer y={6} />
            <Accordion>
                <AccordionItem
                    key="report_actions"
                    aria-label="Report Actions"
                    title="Actions"
                    classNames={{
                        title: "text-2xl text-neutral-300 tracking-wider phone:text-xl"
                    }}
                >
                    <div className="grid grid-cols-4 tablet:grid-cols-1 gap-4">
                        <GenericButton
                            variant="flat"
                            startContent={<SpreadsheetIcon width={20} fill="#00D615" />}
                        >
                            Export to Spreadsheet
                        </GenericButton>
                        <GenericButton
                            variant="flat"
                            startContent={<PDFIcon width={20} fill="#00D615" />}
                        >
                            Export to PDF
                        </GenericButton>
                    </div>
                </AccordionItem>
            </Accordion>
        </div>
    );
};