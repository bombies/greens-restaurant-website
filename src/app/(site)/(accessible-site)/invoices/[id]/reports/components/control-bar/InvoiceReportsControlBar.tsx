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
import { Invoice, InvoiceItem } from "@prisma/client";
import { sendToast } from "../../../../../../../../utils/Hooks";
import { downloadFileFromBlob } from "../../../../../../../../utils/client-utils";
import { formatDateDDMMYYYY, generateInvoiceTotal } from "../../../../components/invoice-utils";
// @ts-ignore
import Exceljs from "exceljs/dist/exceljs.min";

interface Props {
    id: string,
    customerName: string,
    currentItems: (Invoice & { invoiceItems: InvoiceItem[] })[],
    reportParams: ReportParamsState,
    dispatchReportParams: Dispatch<{ type: ReportParamsActionType, payload: Partial<ReportParamsState> }>
}

export const InvoiceReportsControlBar: FC<Props> = ({
                                                        id,
                                                        customerName,
                                                        currentItems,
                                                        reportParams,
                                                        dispatchReportParams
                                                    }) => {
    const [startDate, setStartDate] = useState<Date>();
    const [endDate, setEndDate] = useState<Date>();
    const [spreadsheetIsExporting, setSpreadsheetIsExporting] = useState(false);

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
                    disabled={spreadsheetIsExporting}
                    id="start_date"
                    label="Start Date"
                    labelPlacement="above"
                    onDateChange={setStartDate}
                    max={endDate}
                />
                <GenericDatePicker
                    disabled={spreadsheetIsExporting}
                    id="end_date"
                    label="End Date"
                    labelPlacement="above"
                    onDateChange={setEndDate}
                    min={startDate}
                />
                <ChangeInvoiceReportStatusButton
                    disabled={spreadsheetIsExporting}
                    dispatchReportParams={dispatchReportParams}
                />
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
                            disabled={spreadsheetIsExporting}
                            isLoading={spreadsheetIsExporting}
                            variant="flat"
                            startContent={<SpreadsheetIcon width={20} fill="#00D615" />}
                            onPress={async () => {
                                try {
                                    setSpreadsheetIsExporting(true);
                                    const workBook = new Exceljs.Workbook();
                                    const workSheet = workBook.addWorksheet(`Invoice Report - ${formatDateDDMMYYYY(new Date(), "-")}`);

                                    workSheet.columns = [
                                        { key: "title", header: "Title", width: 16 },
                                        { key: "description", header: "Description", width: 32 },
                                        { key: "date", header: "Date", width: 10 },
                                        {
                                            key: "total",
                                            header: "Total",
                                            width: 16,
                                            style: { numFmt: "\"$\"#,##0.00;[Red]\-\"$\"#,##0.00" }
                                        },
                                        { key: "status", header: "Status", width: 10 }
                                    ];

                                    currentItems.forEach(item => {
                                        const row = workSheet.addRow({
                                            title: item.title,
                                            description: item.description,
                                            date: new Date(item.createdAt.toString()),
                                            total: generateInvoiceTotal(item),
                                            status: item.paid ? "PAID" : "UNPAID"
                                        });
                                    });

                                    const sheetBuffer = await workBook.xlsx.writeBuffer();
                                    const sheetBlob = new Blob([sheetBuffer]);
                                    downloadFileFromBlob(sheetBlob, `${customerName} Invoice Report - ${formatDateDDMMYYYY(new Date(), "-")}.xlsx`)
                                        .then(() => sendToast({
                                            description: "Successfully exported your report!"
                                        }));
                                } catch (e: any) {
                                    console.error(e);
                                    sendToast({
                                        description: e.message ?? "There was an error exporting your report!"
                                    });
                                } finally {
                                    setSpreadsheetIsExporting(false);
                                }
                            }}
                        >
                            Export to Spreadsheet
                        </GenericButton>
                        <GenericButton
                            disabled={spreadsheetIsExporting}
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