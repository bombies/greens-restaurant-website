"use client";

import GenericButton from "../../../../../../../../_components/inputs/GenericButton";
import { Invoice, InvoiceCustomer, InvoiceItem } from "@prisma/client";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { FetchCompanyInfo } from "../../../../../components/CompanyInvoiceCard";
import InvoicePDF from "./pdf/InvoicePDF";
import exportIcon from "/public/icons/export-gold.svg";

type Props = {
    customer?: InvoiceCustomer
    invoice?: Invoice,
    invoiceItems?: InvoiceItem[]
    disabled: boolean
}

export default function ExportInvoiceButton({ customer, invoice, invoiceItems, disabled }: Props) {
    const { data: companyInfo, isLoading: companyInfoIsLoading } = FetchCompanyInfo();

    return (
        <>
            <PDFDownloadLink
                document={<InvoicePDF
                    companyInfo={companyInfo}
                    customerInfo={customer}
                    invoice={invoice}
                    invoiceItems={invoiceItems}
                />}
                fileName={`${invoice?.title}-${customer?.customerName}.pdf`}
            >
                {({ loading }) =>
                    <GenericButton
                        fullWidth
                        disabled={disabled || companyInfoIsLoading || loading}
                        color="warning"
                        variant="flat"
                        icon={exportIcon}
                    >
                        {loading ? "Generating PDF" : "Export Invoice"}
                    </GenericButton>
                }
            </PDFDownloadLink>
        </>
    );
}