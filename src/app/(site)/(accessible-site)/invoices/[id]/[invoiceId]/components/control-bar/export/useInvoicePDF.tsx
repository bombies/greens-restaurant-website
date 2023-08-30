"use client";

import { FetchCompanyInfo } from "../../../../../components/CompanyInvoiceCard";
import { useMemo } from "react";
import InvoicePDF from "./pdf/InvoicePDF";
import { Invoice, InvoiceCustomer, InvoiceItem } from "@prisma/client";

type Props = {
    customer?: InvoiceCustomer
    invoice?: Invoice,
    invoiceItems?: InvoiceItem[]
}

const useInvoicePDF = ({ customer, invoice, invoiceItems }: Props) => {
    const { data: companyInfo, isLoading: companyInfoIsLoading } = FetchCompanyInfo();
    const pdf = useMemo(() => (
        <InvoicePDF
            companyInfo={companyInfo}
            customerInfo={customer}
            invoice={invoice}
            invoiceItems={invoiceItems}
        />
    ), [companyInfo, customer, invoice, invoiceItems]);

    return { pdf, companyInfoIsLoading };
};

export default useInvoicePDF;