"use client";

import GenericButton from "../../../../../../../../_components/inputs/GenericButton";
import { Invoice, InvoiceCustomer, InvoiceInformation, InvoiceItem } from "@prisma/client";
import { Document, Font, Page, PDFDownloadLink, StyleSheet, Text, View, Image } from "@react-pdf/renderer";
import { FetchCompanyInfo } from "../../../../../../inventory/_components/CompanyInvoiceCard";
import { dollarFormat } from "../../../../../../../../../utils/GeneralUtils";
import InvoicePDF from "./pdf/InvoicePDF";

type Props = {
    customer?: InvoiceCustomer
    invoice?: Invoice & { invoiceItems: InvoiceItem[] }
    disabled: boolean
}

export default function ExportInvoiceButton({ customer, invoice, disabled }: Props) {
    const { data: companyInfo, isLoading: companyInfoIsLoading } = FetchCompanyInfo();

    return (
        <>
            <PDFDownloadLink
                document={<InvoicePDF
                    companyInfo={companyInfo}
                    customerInfo={customer}
                    invoice={invoice}
                />}
                fileName={`${invoice?.title}-${customer?.customerName}.pdf`}
            >
                {({ loading }) =>
                    <GenericButton
                        fullWidth
                        disabled={disabled || companyInfoIsLoading || loading}
                        color="warning"
                        variant="flat"
                    >
                        {loading ? "Generating PDF" : "Export Invoice"}
                    </GenericButton>
                }
            </PDFDownloadLink>
        </>
    );
}