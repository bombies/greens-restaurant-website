"use client";

import GenericButton from "../../../../../../../../_components/inputs/GenericButton";
import { Invoice, InvoiceCustomer, InvoiceItem } from "@prisma/client";
import exportIcon from "/public/icons/export-gold.svg";
import { usePDF } from "@react-pdf/renderer";
import { useEffect } from "react";
import { formatInvoiceNumber } from "../../../../../utils/invoice-utils";
import useInvoicePDF from "./useInvoicePDF";

type Props = {
    customer?: InvoiceCustomer
    invoice?: Invoice,
    invoiceItems?: InvoiceItem[]
    disabled: boolean
}

export default function ExportInvoiceButton({ customer, invoice, invoiceItems, disabled }: Props) {
    const { pdf: invoicePdf, companyInfoIsLoading } = useInvoicePDF({ customer, invoice, invoiceItems });
    const [pdfInstance, updatePdfInstance] = usePDF({
        document: invoicePdf
    });

    useEffect(() => {
        updatePdfInstance(invoicePdf);
    }, [invoicePdf, updatePdfInstance]);

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
                        aTag.setAttribute("download", `Invoice #${formatInvoiceNumber(invoice?.number ?? 0)}-${customer?.customerName}.pdf`);
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