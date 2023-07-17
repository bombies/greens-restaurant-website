"use client";

import GenericButton from "../../../../../../../../_components/inputs/GenericButton";
import { Invoice, InvoiceCustomer, InvoiceItem } from "@prisma/client";
import { FetchCompanyInfo } from "../../../../../components/CompanyInvoiceCard";
import InvoicePDF from "./pdf/InvoicePDF";
import exportIcon from "/public/icons/export-gold.svg";
import { usePDF } from "@react-pdf/renderer";
import { useEffect } from "react";

type Props = {
    customer?: InvoiceCustomer
    invoice?: Invoice,
    invoiceItems?: InvoiceItem[]
    disabled: boolean
}

export default function ExportInvoiceButton({ customer, invoice, invoiceItems, disabled }: Props) {
    const { data: companyInfo, isLoading: companyInfoIsLoading } = FetchCompanyInfo();
    const [pdfInstance, updatePdfInstance] = usePDF({
        document: <InvoicePDF
            companyInfo={companyInfo}
            customerInfo={customer}
            invoice={invoice}
            invoiceItems={invoiceItems}
        />
    });

    useEffect(() => {
        updatePdfInstance(<InvoicePDF
            companyInfo={companyInfo}
            customerInfo={customer}
            invoice={invoice}
            invoiceItems={invoiceItems}
        />);
    }, [companyInfo, customer, invoice, invoiceItems, updatePdfInstance]);

    return (
        <>
            <GenericButton
                fullWidth
                disabled={disabled || companyInfoIsLoading || pdfInstance.loading}
                color="warning"
                variant="flat"
                icon={exportIcon}
                onPress={() => {
                    const aTag = document.createElement("a");
                    if (pdfInstance.url) {
                        aTag.href = pdfInstance.url;
                        aTag.setAttribute("download", `${invoice?.title}-${customer?.customerName}.pdf`);
                        document.body.appendChild(aTag);
                        aTag.click();
                    }
                    aTag.remove();
                }}
            >
                {pdfInstance.loading ? "Generating PDF" : "Export Invoice"}
            </GenericButton>
        </>
    );
}