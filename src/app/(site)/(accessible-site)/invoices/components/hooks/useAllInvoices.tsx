"use client";

import useSWR from "swr";
import { fetcher } from "../../../employees/_components/EmployeeGrid";
import { InvoiceWithExtras } from "../../../../../api/invoices/types";

const useAllInvoices = () => {
    return useSWR("/api/invoices", fetcher<InvoiceWithExtras[]>);
};

export default useAllInvoices;