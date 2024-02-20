"use client";

import React, { Dispatch, FC, useState } from "react";
import { Accordion, AccordionItem, Spacer } from "@nextui-org/react";
import { GoBackButton } from "../../../components/control-bar/InvoiceCustomerControlBar";
import { ChangeInvoiceReportStatusButton } from "./ChangeInvoiceReportStatusButton";
import { GenericDatePicker } from "../../../../../../../_components/GenericDatePicker";
import { Divider } from "@nextui-org/divider";
import SubTitle from "../../../../../../../_components/text/SubTitle";
import GenericButton from "../../../../../../../_components/inputs/GenericButton";
import SpreadsheetIcon from "../../../../../../../_components/icons/SpreadsheetIcon";
import { downloadFileFromBlob } from "../../../../../../../../utils/client-utils";
import { formatDateDDMMYYYY, generateInvoiceTotal, invoiceIsOverdue } from "../../../../utils/invoice-utils";
import Exceljs from "exceljs";
import { useReportDateRange } from "../hooks/useReportDateRange";
import { ReportParamsActionType, ReportParamsState } from "../hooks/useInvoiceReport";
import { toast } from "react-hot-toast";
import { InvoiceWithOptionalItems } from "../../../../../home/_components/widgets/invoice/InvoiceWidget";

interface Props {
    id: string,
    customerName: string,
    currentItems: InvoiceWithOptionalItems[],
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
    const {
        startDate,
        endDate,
        setEndDate,
        setStartDate
    } = useReportDateRange(dispatchReportParams);
    const [spreadsheetIsExporting, setSpreadsheetIsExporting] = useState(false);

    return (
        <div className="default-container p-12">
            <GoBackButton href={`/invoices/${id}`} label="View All Invoices" />
            <Divider className="my-6" />
            <SubTitle>Filter Invoices</SubTitle>
            <Spacer y={6} />
            <div className="grid place-content-center grid-cols-3 default-container p-6 tablet:grid-cols-1 gap-4">
                <GenericDatePicker
                    isDisabled={spreadsheetIsExporting}
                    id="start_date"
                    label="Start Date"
                    labelPlacement="above"
                    onDateChange={setStartDate}
                    max={endDate}
                    isClearable
                />
                <GenericDatePicker
                    isDisabled={spreadsheetIsExporting}
                    id="end_date"
                    label="End Date"
                    labelPlacement="above"
                    onDateChange={setEndDate}
                    min={startDate}
                    isClearable
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
                                        { key: "number", header: "Number", width: 16 },
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

                                    let lastRow = 1;
                                    currentItems.forEach((item, i) => {
                                        const row = workSheet.addRow({
                                            number: item.number,
                                            description: item.description,
                                            date: new Date(item.createdAt.toString()),
                                            total: generateInvoiceTotal(item),
                                            status: item.paid ? "PAID" : (!invoiceIsOverdue(item) ? "UNPAID" : "OVERDUE")
                                        });
                                        lastRow++;
                                    });

                                    workSheet.addRow({
                                        date: "GRAND TOTAL",
                                        total: { formula: `SUM(D2:D${lastRow})`, date1904: false }
                                    });

                                    const sheetBuffer = await workBook.xlsx.writeBuffer();
                                    const sheetBlob = new Blob([sheetBuffer]);
                                    downloadFileFromBlob(sheetBlob, `${customerName} Invoice Report - ${formatDateDDMMYYYY(new Date(), "-")}.xlsx`)
                                        .then(() => toast.success("Successfully exported your report!"));
                                } catch (e: any) {
                                    console.error(e);
                                    toast.error(e.message ?? "There was an error exporting your report!");
                                } finally {
                                    setSpreadsheetIsExporting(false);
                                }
                            }}
                        >
                            Export to Spreadsheet
                        </GenericButton>
                        {/*<GenericButton*/}
                        {/*    disabled={spreadsheetIsExporting}*/}
                        {/*    variant="flat"*/}
                        {/*    startContent={<PDFIcon width={20} fill="#00D615" />}*/}
                        {/*>*/}
                        {/*    Export to PDF*/}
                        {/*</GenericButton>*/}
                    </div>
                </AccordionItem>
            </Accordion>
        </div>
    );
};