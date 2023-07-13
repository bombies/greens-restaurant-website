"use client";

import DropdownInput from "../../../../../../_components/inputs/DropdownInput";
import { useState } from "react";
import axios from "axios";
import useSWRMutation from "swr/mutation";
import { sendToast } from "../../../../../../../utils/Hooks";

enum PaidStatus {
    PAID = "PAID",
    UNPAID = "UNPAID"
}

type Props = {
    initialStatus?: boolean | null,
    customerId?: string,
    invoiceId?: string,
}

type ChangePaidStatusArgs = {
    arg: {
        status: boolean
    }
}

const ChangePaidStatus = (customerId?: string, invoiceId?: string) => {
    const mutator = (url: string, { arg }: ChangePaidStatusArgs) => axios.patch(url, {
        paid: arg.status
    });
    return useSWRMutation(`/api/invoices/customer/${customerId}/invoice/${invoiceId}`, mutator);
};

export default function InvoicePaidStatus({ initialStatus, customerId, invoiceId }: Props) {
    const [selectedStatus, setSelectedStatus] = useState<PaidStatus>(initialStatus ? PaidStatus.PAID : PaidStatus.UNPAID);
    const { trigger: triggerStatusChange, isMutating: statusIsChanging } = ChangePaidStatus(customerId, invoiceId);

    return (
        <DropdownInput
            variant="flat"
            color={selectedStatus === PaidStatus.PAID ? "success" : "danger"}
            isLoading={statusIsChanging}
            selectedValueLabel
            keys={[selectedStatus === PaidStatus.PAID ? PaidStatus.UNPAID : PaidStatus.PAID]}
            selectedKeys={[selectedStatus]}
            setSelectedKeys={(keys) => {
                const status = (Array.from(keys) as PaidStatus[])[0].toUpperCase();
                triggerStatusChange({
                    status: status === PaidStatus.PAID
                })
                    .then((res) => {
                        setSelectedStatus(status as PaidStatus);
                    })
                    .catch(e => {
                        console.error(e);
                        sendToast({
                            error: e,
                            description: "There was an error updating the paid status!"
                        });
                    });
            }}
        />
    );
}