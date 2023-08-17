"use client";

import { useEffect, useState } from "react";
import { PaidStatus } from "../InvoicePaidStatus";
import { Invoice } from "@prisma/client";

type Params = {
    invoice?: Invoice,
    invoiceIsLoading: boolean
}

export const useInvoicePaymentStatus = ({ invoice, invoiceIsLoading }: Params) => {
    const [selectedStatus, setSelectedStatus] = useState<PaidStatus>(invoice?.paid ? PaidStatus.PAID : PaidStatus.UNPAID);

    useEffect(() => {
        if (!invoiceIsLoading && invoice)
            setSelectedStatus(invoice.paid ? PaidStatus.PAID : PaidStatus.UNPAID)
    }, [invoice, invoiceIsLoading]);
    
    return {selectedStatus, setSelectedStatus}
};