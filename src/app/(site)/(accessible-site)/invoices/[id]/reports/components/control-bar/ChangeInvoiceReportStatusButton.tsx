import React, { Dispatch, FC, useEffect, useState } from "react";
import { PaidStatus } from "../../../[invoiceId]/components/InvoicePaidStatus";
import DropdownInput from "../../../../../../../_components/inputs/DropdownInput";
import { ReportParamsActionType, ReportParamsState } from "../hooks/useInvoiceReport";

interface Props {
    disabled?: boolean,
    dispatchReportParams: Dispatch<{ type: ReportParamsActionType, payload: Partial<ReportParamsState> }>
}

export const ChangeInvoiceReportStatusButton: FC<Props> = ({ disabled, dispatchReportParams }) => {
    const [selectedStatus, setSelectedStatus] = useState<PaidStatus>(PaidStatus.ALL);

    useEffect(() => {
        switch (selectedStatus) {
            case PaidStatus.PAID: {
                dispatchReportParams({
                    type: ReportParamsActionType.SET,
                    payload: {
                        status: "paid"
                    }
                });
                break;
            }
            case PaidStatus.UNPAID: {
                dispatchReportParams({
                    type: ReportParamsActionType.SET,
                    payload: {
                        status: "unpaid"
                    }
                });
                break;
            }
            case PaidStatus.ALL: {
                dispatchReportParams({
                    type: ReportParamsActionType.SET,
                    payload: {
                        status: null
                    }
                });
                break;
            }
            case PaidStatus.OVERDUE: {
                dispatchReportParams({
                    type: ReportParamsActionType.SET,
                    payload: {
                        status: "overdue"
                    }
                });
            }
        }
    }, [dispatchReportParams, selectedStatus]);

    return (
        <DropdownInput
            disabled={disabled}
            label="Status"
            labelPlacement="above"
            variant="flat"
            color={selectedStatus === PaidStatus.PAID ? "success" : ((selectedStatus === PaidStatus.UNPAID || selectedStatus === PaidStatus.OVERDUE) ? "danger" : "warning")}
            selectedValueLabel
            keys={[PaidStatus.UNPAID, PaidStatus.OVERDUE, PaidStatus.PAID, PaidStatus.ALL]}
            selectedKeys={[selectedStatus]}
            setSelectedKeys={(keys) => {
                const status = (Array.from(keys) as PaidStatus[])[0].toUpperCase();
                if (status === selectedStatus)
                    return;
                setSelectedStatus(status as (PaidStatus));
            }}
        />
    );
};