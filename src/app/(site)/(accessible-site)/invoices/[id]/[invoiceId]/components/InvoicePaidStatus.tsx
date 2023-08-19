"use client";

import DropdownInput from "../../../../../../_components/inputs/DropdownInput";

export enum PaidStatus {
    PAID = "PAID",
    UNPAID = "UNPAID",
    ALL = "ALL",
    OVERDUE = "OVERDUE"
}

type Props = {
    selectedStatus: PaidStatus,
    statusIsChanging?: boolean,
    onStatusChange?: (status: PaidStatus) => void
}

export default function InvoicePaidStatus({ selectedStatus, statusIsChanging, onStatusChange }: Props) {


    return (
        <DropdownInput
            variant="flat"
            buttonClassName="font-semibold"
            color={selectedStatus === PaidStatus.PAID ? "success" : "danger"}
            isLoading={statusIsChanging}
            selectedValueLabel
            keys={[selectedStatus === PaidStatus.PAID ? PaidStatus.UNPAID : PaidStatus.PAID]}
            selectedKeys={[selectedStatus]}
            setSelectedKeys={(keys) => {
                const status = (Array.from(keys) as PaidStatus[])[0].toUpperCase();
                if (onStatusChange)
                    onStatusChange(status as PaidStatus);
            }}
        />
    );
}